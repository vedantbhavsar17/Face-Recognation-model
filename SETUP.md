# Face recognition environment

Use the project virtual environment:

```sh
source .venv/bin/activate
```

For notebooks, select this project's `.venv/bin/python` as the Python interpreter/kernel.

## Recreate the environment

These commands target the Python 3.9 environment used for this project:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip wheel 'setuptools<81'
CFLAGS='-UTARGET_OS_MAC' python -m pip install -r requirements.txt
python -m pip install -r requirements-dev.txt
python -m ipykernel install --user --name face-recognition-model --display-name 'Face Recognition (.venv)'
```

The CFLAGS setting applies only to that installation command. It avoids legacy
Macintosh code paths in dlib's bundled libpng and zlib that are triggered by the
new Apple compiler's predefined `TARGET_OS_MAC` macro. Those code paths can cause
the missing `fp.h` error and an `fdopen` macro error with modern macOS SDKs.

Keep setuptools below 81 because face-recognition-models 0.3.0 uses pkg_resources.

Verify the installation:

```sh
python -c "import dlib, face_recognition; print('Imports successful:', dlib.__version__)"
python -m pip check
```

In Jupyter, choose the `Face Recognition (.venv)` kernel.
