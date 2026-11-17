# Compresor de imágenes mediante SVD

Programa de consola en Python que aproxima imágenes con una SVD truncada. Las imágenes RGB se procesan canal por canal; la transparencia de PNG se conserva sin modificar.

El proyecto también incluye una SPA educativa en React que permite visualizar la compresión, modificar `k` con un slider y recorrer la explicación matemática paso a paso.

## Instalación

```powershell
python -m pip install -r requirements.txt
```

## Uso

Con un número explícito de componentes:

```powershell
python main.py --image foto.jpg --k 50
```

Con una reducción matemática objetivo del almacenamiento:

```powershell
python main.py --image foto.png --compression 70 --output output\foto_svd.png
```

`--compression` representa el porcentaje de reducción de la representación matemática, no una garantía del tamaño final en bytes del archivo, ya que PNG/JPEG aplican su propia codificación.

## Aplicación web educativa

La aplicación web usa React + Vite, Tailwind CSS, `ml-matrix`, Canvas, KaTeX y `lucide-react`.

```powershell
npm install
npm run dev
```

Después, abre la URL mostrada por Vite. La aplicación:

- Presenta un selector inicial entre el laboratorio SVD y el flujo de compresión/descompresión.
- Reduce imágenes a un máximo de 160 × 160 píxeles para proteger el rendimiento del navegador.
- Procesa los canales RGB con SVD en el cliente.
- Permite variar `k` en tiempo real.
- Muestra dimensiones, almacenamiento SVD, reducción y MSE.
- Incluye un panel didáctico de cuatro pasos con fórmulas LaTeX.
- Permite descargar la reconstrucción como PNG.
- Permite descargar la representación matemática como `imagen_comprimida.svd.json`.
- Permite cargar ese archivo SVD en el modo de descompresión para reconstruir la imagen sin recalcularla desde el PNG.
- Permite reconstruir con rango completo para comprobar la reversibilidad matemática de la matriz.

La reconstrucción con un `k` truncado es aproximada: los componentes singulares descartados no pueden recuperarse. La reversión prácticamente exacta requiere conservar todos los componentes y, por tanto, normalmente no produce reducción de almacenamiento.

El archivo `.svd.json` contiene las matrices `U`, los valores singulares y `Vᵀ` de cada canal RGB, además de las dimensiones y `k`. El PNG reconstruido no contiene esta información matemática y no puede utilizarse para recuperar los componentes descartados.

Componentes principales:

- `src/components/ImageUploader.jsx`
- `src/components/SVDVisualizer.jsx`
- `src/components/EducationalPanel.jsx`
- `src/utils/svdProcessor.js`
- `src/hooks/useSVD.js`
