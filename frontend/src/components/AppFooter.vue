<template>
  <footer class="app-footer relative z-40 px-8 pt-16 pb-10 mt-20 border-t-4 border-[#facc15] bg-[#0b0d17] shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
    
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 text-left">
      <!-- Brand Section -->
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-4 group cursor-default">
          <div class="p-2 border-2 border-[#facc15]/20 bg-[#0f172a] group-hover:border-[#facc15] transition-colors">
            <img src="/code-kingdoms-logo.png" alt="logo" width="48" height="48" class="logo-img">
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-[#facc15] text-[10px] tracking-[0.3em] font-bold">CODE & KINGDOMS</span>
            <span class="text-[#facc15]/40 text-[7px] tracking-widest italic">EST. 2026</span>
          </div>
        </div>
        <p class="text-[#facc15]/30 text-[8px] leading-7 max-w-xs">
          "En la forja del código, solo los más persistentes alcanzan la maestría. El compilador juzgará tus actos."
        </p>
        <div class="flex gap-5">
          <a v-for="social in socials" :key="social.label" href="#" class="social-icon" :aria-label="social.label" v-html="social.icon"></a>
        </div>
      </div>

      <!-- Links Grid -->
      <div class="grid grid-cols-2 gap-8">
        <div class="flex flex-col gap-5">
          <h4 class="text-[#facc15] text-[9px] mb-2 tracking-[0.2em] font-bold flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-[#facc15] rotate-45"></span> EXPLORAR
          </h4>
          <router-link to="/" class="footer-link">EL MUNDO</router-link>
          <router-link to="/personajes" class="footer-link">MIS HÉROES</router-link>
          <router-link to="/comunidad" class="footer-link">COMUNIDAD</router-link>
        </div>
        <div class="flex flex-col gap-5">
          <h4 class="text-[#facc15] text-[9px] mb-2 tracking-[0.2em] font-bold flex items-center gap-3">
            <span class="w-1.5 h-1.5 bg-[#facc15] rotate-45"></span> SOPORTE
          </h4>
          <a href="#" class="footer-link">SOPORTE TÉCNICO</a>
          <a href="#" class="footer-link">PRIVACIDAD</a>
          <a href="#" class="footer-link">TÉRMINOS</a>
        </div>
      </div>

      <!-- Status Panel -->
      <div class="premium-status-box">
        <div class="absolute top-0 right-0 p-2 opacity-10">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        </div>
        <h4 class="text-[#facc15] text-[9px] mb-6 tracking-[0.2em] font-bold">ESTADO DEL REINO</h4>
        <div class="flex flex-col gap-5">
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 tracking-widest uppercase">Núcleo Central</span>
            <span class="flex items-center gap-2 text-[#4ade80] text-[7px] font-bold">
              <span class="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse shadow-[0_0_8px_#4ade80]"></span> 
              ESTABLE
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 tracking-widest uppercase">Versión Actual</span>
            <span class="text-[#facc15] text-[7px] font-bold px-3 py-1 bg-[#facc15]/5 border border-[#facc15]/20">BETA 0.1.5</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 tracking-widest uppercase">Latencia</span>
            <span class="text-[#facc15]/60 text-[7px]">24 MS</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto pt-10 border-t border-[#facc15]/10 flex flex-col md:flex-row justify-between items-center gap-6">
      <p class="text-[7px] text-[#facc15]/20 tracking-[0.4em] uppercase">© 2026 CODE & KINGDOMS — TODOS LOS DERECHOS RESERVADOS</p>
      <div class="flex gap-8">
        <span class="text-[6px] text-[#facc15]/20 hover:text-[#facc15]/40 cursor-pointer transition-colors">HECHO CON PASIÓN</span>
        <span class="text-[6px] text-[#facc15]/20 hover:text-[#facc15]/40 cursor-pointer transition-colors">BY DEEPMIND AGENTS</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
const socials = [
  { label: 'Instagram', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>' },
  { label: 'Twitter', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>' },
  { label: 'GitHub', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>' }
]
</script>

<style scoped>
.logo-img { filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.3)); }

.footer-link {
  color: rgba(250, 204, 21, 0.4);
  font-size: 8px;
  text-decoration: none;
  transition: all 0.3s;
  letter-spacing: 0.1em;
}
.footer-link:hover {
  color: #facc15;
  transform: translateX(5px);
}

.social-icon {
  color: rgba(250, 204, 21, 0.4);
  transition: all 0.3s;
  padding: 8px;
  background: #0f172a;
  border: 1px solid rgba(250, 204, 21, 0.1);
}
.social-icon:hover {
  color: #facc15;
  transform: translateY(-5px) rotate(8deg);
  border-color: #facc15;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
}

.premium-status-box {
  padding: 24px;
  border: 2px solid rgba(250, 204, 21, 0.1);
  background: rgba(15, 23, 42, 0.5);
  position: relative;
  overflow: hidden;
}

.premium-status-box::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #facc15, transparent);
  animation: shine-border 3s infinite;
}

@keyframes shine-border {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-pulse {
  animation: pulse-simple 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse-simple {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
