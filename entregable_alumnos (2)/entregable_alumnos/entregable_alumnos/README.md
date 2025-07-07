# ejemplo-llm-1

## Requisitos previos

- Node.js >= 18
- Tener [Ollama](https://ollama.com/) instalado y corriendo en tu máquina.
- Descargar el modelo que quieras usar, por ejemplo:  
  ```
  ollama run gemma3:1b
  ```

## Instalación

1. Clona este repositorio o descarga los archivos.
2. Instala las dependencias:
   ```
   npm install
   ```

## Uso

Para iniciar el bot de ejemplo ejecuta:

```
npm run ejemplo
```

Luego escribe tus preguntas en la consola.  
Para salir, escribe `salir`.


## Cambiar el modelo

Puedes cambiar el modelo editando la línea correspondiente en `ejemplo.js`:

```js
model: "gemma3:1b" // Cambia por "mistral:7b", "llama2:7b", etc.
```
