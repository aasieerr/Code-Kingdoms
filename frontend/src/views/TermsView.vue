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
            TÉRMINOS DE USO
          </h1>
          <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent"></div>
        </div>
        <p class="text-[#facc15]/60 text-[9px] leading-8 max-w-2xl mx-auto uppercase tracking-widest">
          CONDICIONES DE ACCESO Y UTILIZACIÓN DE CODE & KINGDOMS.
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
    heading: '1. Objeto',
    paragraphs: [
      'Estos términos regulan el acceso y uso de Code & Kingdoms, una experiencia de juego y aprendizaje en fase beta desarrollada como proyecto privado.',
      'Al crear una cuenta o utilizar la plataforma aceptas estas condiciones. Si no estás de acuerdo con ellas, no debes usar el servicio.',
    ],
  },
  {
    heading: '2. Naturaleza del servicio',
    paragraphs: [
      'La aplicación se ofrece con carácter experimental, sin despliegue comercial estable ni compromiso de disponibilidad continua. Puede sufrir interrupciones, reinicios, pérdida temporal de datos o cambios sustanciales sin previo aviso.',
      'El acceso puede limitarse a entornos de prueba, invitaciones o usuarios autorizados por el equipo promotor.',
    ],
  },
  {
    heading: '3. Cuentas de usuario',
    paragraphs: [
      'Eres responsable de la veracidad de los datos facilitados en el registro y de mantener la confidencialidad de tus credenciales. Cualquier actividad realizada desde tu cuenta se presumirá realizada por ti.',
      'El equipo puede suspender o eliminar cuentas que incumplan estas condiciones, comprometan la seguridad del entorno o utilicen el servicio de forma abusiva.',
    ],
  },
  {
    heading: '4. Uso permitido',
    paragraphs: [
      'Puedes utilizar Code & Kingdoms para jugar, probar mecánicas, crear personajes, participar en funciones de comunidad internas y compartir capturas o contenidos permitidos por la propia aplicación.',
      'Queda prohibido intentar acceder sin autorización a sistemas ajenos a tu cuenta, explotar vulnerabilidades, automatizar el uso de forma abusiva, interferir con otros jugadores o utilizar la plataforma con fines ilícitos.',
    ],
  },
  {
    heading: '5. Contenidos y propiedad',
    paragraphs: [
      'El software, la identidad visual, los mapas, personajes, textos y demás elementos del proyecto pertenecen a sus autores o licenciantes. No se concede ningún derecho de explotación comercial sobre ellos.',
      'Los contenidos que subas, como capturas o mensajes, deben respetar la legalidad vigente y los derechos de terceros. Concedes al proyecto una licencia limitada para mostrarlos dentro del entorno de la aplicación.',
    ],
  },
  {
    heading: '6. Exclusión de garantías',
    paragraphs: [
      'El servicio se proporciona tal cual, sin garantías expresas o implícitas de funcionamiento ininterrumpido, ausencia de errores o idoneidad para un fin concreto.',
      'El uso de la plataforma es bajo tu propia responsabilidad, especialmente en un entorno beta no destinado a explotación comercial.',
    ],
  },
  {
    heading: '7. Limitación de responsabilidad',
    paragraphs: [
      'En la medida permitida por la ley, el equipo promotor no será responsable de daños indirectos, pérdida de progreso, interrupciones del servicio o fallos derivados del uso experimental de la aplicación.',
    ],
  },
  {
    heading: '8. Modificaciones y contacto',
    paragraphs: [
      'Podemos actualizar estos términos para adaptarlos a cambios del proyecto. La versión publicada en esta página prevalecerá sobre versiones anteriores.',
      'Para incidencias, solicitudes de acceso o consultas legales puedes contactar con el equipo a través de la sección de soporte técnico.',
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
