from pathlib import Path
import os

from flask import Flask, request, render_template, jsonify
from PIL import Image, ImageOps, UnidentifiedImageError
import numpy as np
import face_recognition as fr
import joblib as jb

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
BASE_DIR = Path(__file__).resolve().parent

knn = jb.load(BASE_DIR / "knn_model.pkl")


def encode_face(image_path):
    image = fr.load_image_file(str(image_path))
    locations = fr.face_locations(image)

    if len(locations) != 1:
        return None

    encodings = fr.face_encodings(
        image, known_face_locations=locations
    )
    return encodings[0] if encodings else None


def recognize_face(image_path):
    encoding = encode_face(image_path)

    if encoding is None:
        return "Please provide an image containing exactly one face."

    return str(knn.predict([encoding])[0])


@app.route("/")
def hello_world():
    return render_template('index.html', celebrity_count=len(knn.classes_))


@app.errorhandler(413)
def too_large(error):
    return jsonify(error='Please choose an image smaller than 10 MB.'), 413


@app.get('/health')
def health():
    return jsonify(status='ok', model_loaded=hasattr(knn, 'classes_')), 200


@app.post('/predict')
def predict():
    upload = request.files.get('image')
    if not upload or not upload.filename:
        return jsonify(error='Choose a JPG, PNG, or WebP image first.'), 400
    try:
        with Image.open(upload.stream) as source:
            if source.format not in {'JPEG', 'PNG', 'WEBP'}:
                return jsonify(error='Please use a JPG, PNG, or WebP image.'), 400
            if source.width * source.height > 25_000_000:
                return jsonify(error='This image is too large. Resize it and try again.'), 400
            image = ImageOps.exif_transpose(source).convert('RGB')
            image.thumbnail((1600, 1600))
            pixels = np.array(image)
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        return jsonify(error='We could not read this image. Please choose another file.'), 400
    locations = fr.face_locations(pixels)
    if len(locations) != 1:
        message = ('No face found. Try a clear, front-facing photo.' if not locations
                   else 'More than one face found. Choose a photo of one person.')
        return jsonify(error=message), 422
    encodings = fr.face_encodings(pixels, known_face_locations=locations)
    if not encodings:
        return jsonify(error='Could not encode this face. Try another photo.'), 422
    return jsonify(name=str(knn.predict([encodings[0]])[0]))


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', '5000')))
