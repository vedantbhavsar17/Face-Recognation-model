# Facefolio

A Flask app that accepts a portrait and predicts the closest celebrity using
face-recognition embeddings and a trained KNN classifier.

## Run locally

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000. For the macOS compiler workaround and notebook setup,
see [SETUP.md](SETUP.md). Install `requirements-dev.txt` for the training notebook.

## Render

1. Connect this private GitHub repository to Render with repository access.
2. Create a Blueprint from `render.yaml`, or a Web Service with Docker runtime.
3. Use `/health` as the health check path. Docker supplies the Gunicorn command
   and binds to Render's `PORT`. Automatic deploys are disabled in the Blueprint.
4. Choose an instance with enough memory for dlib and the model. Source compilation
   of dlib may take several minutes; inspect build logs before treating it as stuck.

No Render service is created by pushing this repository.

## Endpoints

- `GET /`: upload interface.
- `GET /health`: HTTP 200 JSON after the model has loaded successfully at startup.
- `POST /predict`: multipart form field `image`; returns a celebrity `name` or an
  `error` with HTTP 400, 413, or 422. Accepts JPEG, PNG, and WebP up to 10 MB,
  with exactly one detectable face. Images are processed in memory, without saving.

## Repository contents

The app, templates, static assets, trained `knn_model.pkl`, and training notebook
are included. Notebook outputs are cleared before publication. Local training
images, generated CSV manifests containing machine-specific paths, virtual
environments, secrets, and obsolete function pickles are ignored. The full dataset
is not needed to serve predictions. To retrain, provide your own dataset and
regenerate the CSV manifests used by `model.ipynb`.

The notebook was trained with scikit-learn 1.6.1; keep that version when loading
the saved model. Only load model files you trust.

## Limitations

The classifier always chooses a known celebrity; an unknown-person rejection
threshold has not been calibrated. Results are predictions, not verified
identities. The reported notebook accuracy applies to its held-out split and
does not establish accuracy on arbitrary uploads.
