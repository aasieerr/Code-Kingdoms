<template>
  <div class="pixel-page min-h-screen flex flex-col">
    <AppHeader />

    <div
      class="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
      style="background: repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 2px);"
    ></div>

    <main class="relative z-10 max-w-4xl mx-auto px-6 py-20 flex-grow w-full">
      <div class="text-center mb-16">
        <div class="inline-block relative mb-6">
          <h1 class="text-[#facc15] text-3xl tracking-tighter" style="text-shadow: 4px 4px 0 #854d0e;">
            POLÍTICA DE PRIVACIDAD
          </h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          INFORMACIÓN SOBRE EL TRATAMIENTO DE DATOS EN CODE & KINGDOMS.
        </p>
        <p class="text-[#facc15]/35 text-[7px] mt-4 tracking-widest uppercase">Última actualización: mayo de 2026</p>
      </div>

      <article class="legal-document">
        <section v-for="section in sections" :key="section.heading" class="legal-section">
          <h2>{{ section.heading }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
        </section>
      </article>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const sections = [
  {
    heading: '1. Responsable del tratamiento',
    paragraphs: [
      'Code & Kingdoms es un proyecto privado de desarrollo y prueba. El responsable del tratamiento de los datos asociados a la plataforma es el equipo promotor del proyecto, contactable a través de los correos publicados en la sección de soporte técnico.',
      'Esta aplicación no constituye un servicio comercial en producción abierta al público general. El acceso se limita a entornos controlados y a usuarios autorizados por el equipo.',
    ],
  },
  {
    heading: '2. Datos que tratamos',
    paragraphs: [
      'Solo tratamos la información estrictamente necesaria para operar la experiencia de juego y la gestión de cuentas internas: nombre de usuario, correo electrónico, contraseña almacenada de forma cifrada, progreso de personajes, inventario, equipamiento, capturas o contenidos que el propio usuario decida subir y registros técnicos mínimos de sesión.',
      'No recopilamos datos con fines publicitarios, de perfilado comercial ni de venta a terceros. No integramos herramientas de analítica de marketing ni redes sociales orientadas a seguimiento.',
    ],
  },
  {
    heading: '3. Finalidad y base del tratamiento',
    paragraphs: [
      'Los datos se utilizan exclusivamente para autenticar usuarios, guardar el progreso del juego, permitir la participación en funciones de comunidad internas y mantener la seguridad básica del entorno.',
      'La base del tratamiento es la ejecución del servicio solicitado por el usuario dentro de un entorno privado de prueba y el interés legítimo del equipo en mantener la integridad técnica del proyecto.',
    ],
  },
  {
    heading: '4. Conservación y seguridad',
    paragraphs: [
      'Los datos se conservan mientras exista la cuenta o mientras resulten necesarios para el funcionamiento del entorno de prueba. Las contraseñas no se almacenan en texto plano.',
      'Aplicamos medidas razonables de seguridad acordes a un proyecto en fase beta, aunque ningún sistema puede garantizar una protección absoluta frente a incidentes.',
    ],
  },
  {
    heading: '5. Almacenamiento local y cookies',
    paragraphs: [
      'La aplicación puede guardar preferencias del jugador, como volumen o atajos de teclado, en el almacenamiento local del navegador. También puede utilizar tokens o cookies técnicas imprescindibles para mantener la sesión iniciada.',
      'No empleamos cookies de seguimiento con fines comerciales.',
    ],
  },
  {
    heading: '6. Cesiones y transferencias',
    paragraphs: [
      'No cedemos datos personales a terceros con fines comerciales. Solo podrán acceder a la información los proveedores técnicos estrictamente necesarios para alojar o mantener el entorno de desarrollo, siempre bajo obligaciones de confidencialidad.',
    ],
  },
  {
    heading: '7. Derechos de las personas usuarias',
    paragraphs: [
      'Puedes solicitar acceso, rectificación o supresión de tus datos, así como la limitación u oposición a determinados tratamientos, escribiendo a cualquiera de los contactos de soporte técnico.',
      'También puedes reclamar ante la autoridad de control competente si consideras que el tratamiento no se ajusta a la normativa aplicable.',
    ],
  },
  {
    heading: '8. Cambios en esta política',
    paragraphs: [
      'Podemos actualizar este documento para reflejar cambios técnicos o legales del proyecto. La versión vigente estará siempre disponible en esta página.',
    ],
  },
]
</script>

<style scoped>
.legal-document {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 32px;
  border: 2px solid rgba(250, 204, 21, 0.12);
  background: rgba(15, 23, 42, 0.55);
}

.legal-section h2 {
  color: #facc15;
  font-size: 10px;
  letter-spacing: 0.12em;
  margin-bottom: 12px;
}

.legal-section p {
  color: rgba(255, 255, 255, 0.78);
  font-size: 8px;
  line-height: 1.9;
  margin-bottom: 10px;
}

.legal-section p:last-child {
  margin-bottom: 0;
}
</style>
