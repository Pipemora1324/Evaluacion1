# Consola de Vigilancia Sismo-Volcánica en Tiempo Real

Sistema de monitoreo sismológico de alta fidelidad desarrollado para el procesamiento y visualización de 27 canales de datos sismológicos (9 estaciones × 3 componentes) a 200 Hz.

## 🚀 Características Técnicas

* **Arquitectura Multihilo (RT-1):** Procesamiento de tramas e ingesta de datos en segundo plano mediante Web Workers para liberar el hilo principal de la UI.
* **Memoria Compartida Zero-Copy (RT-2 & RT-3):** Uso de `SharedArrayBuffer` y sintaxis `Atomics` para gestionar un buffer circular de 10 minutos de historia (3.24M de muestras) sin bloqueos de memoria.
* **Aislamiento de Origen (RT-5):** Servidor configurado con cabeceras `COOP` (`same-origin`) y `COEP` (`require-corp`) para habilitar capacidades multihilo avanzadas en producción Vercel.
* **Visualización a 60 FPS (RT-6):** Renderizado en tiempo real sobre `Canvas` HTML5 utilizando un algoritmo de diezmado Min/Max optimizado.
* **Monitoreo de Latencia (RT-7):** Medición activa de la métrica INP (Interaction to Next Paint) directamente en la consola.

## 🛠️ Tecnologías

* **Framework:** Next.js (App Router) + TypeScript
* **Estilos:** Tailwind CSS
* **Despliegue:** Vercel (Production Build)

## 🌐 Demo en Vivo

Puedes acceder a la consola desplegada en:
[https://evaluacion1-git-main-pipemora1324s-projects.vercel.app/](https://evaluacion1-git-main-pipemora1324s-projects.vercel.app/)
