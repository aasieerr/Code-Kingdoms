<template>
  <footer class="relative z-40 px-6 pt-12 pb-8 mt-12"
    style="border-top: 5px solid #facc15; background: #0b0d17; box-shadow: 0 -5px 0 #854d0e;">
    
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10 text-left">
      <!-- Brand -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <img src="/code-kingdoms-logo.png" alt="logo" width="40" height="40">
          <span class="text-[#facc15] text-[9px] tracking-widest">CODE & KINGDOMS</span>
        </div>
        <p class="text-[#facc15]/30 text-[7px] leading-6 italic">"EL COMPILADOR JUZGARÁ TUS ACTOS."</p>
        <div class="flex gap-4">
          <!-- Instagram -->
          <a href="#" class="social-icon" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <!-- Facebook -->
          <a href="#" class="social-icon" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <!-- TikTok -->
          <a href="#" class="social-icon" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
        </div>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
          <h4 class="text-[#facc15] text-[8px] mb-1 underline decoration-2 underline-offset-4">JUEGO</h4>
          <router-link to="/" class="footer-link">MUNDO</router-link>
          <router-link to="/comunidad" class="footer-link">COMUNIDAD</router-link>
        </div>
        <div class="flex flex-col gap-4">
          <h4 class="text-[#facc15] text-[8px] mb-1 underline decoration-2 underline-offset-4">LEGAL</h4>
          <a href="#" class="footer-link">PRIVACIDAD</a>
          <a href="#" class="footer-link">TÉRMINOS</a>
        </div>
      </div>

      <!-- Status -->
      <div class="p-4 border-2 border-[#facc15]/10 bg-[#0a0c14]">
        <h4 class="text-[#facc15] text-[8px] mb-4">ESTADO DEL REINO</h4>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 uppercase">Servidores</span>
            <span class="text-[#4ade80] text-[7px] animate-pulse">● ONLINE</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 uppercase">Versión</span>
            <span class="text-[#facc15]/60 text-[7px] px-2 py-0.5 bg-[#facc15]/10 border border-[#facc15]/20">BETA v0.1.0</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto pt-10 border-t border-[#facc15]/10 text-center">
      <p class="text-[7px] text-[#facc15]/20 tracking-[0.3em]">DESARROLLADO CON SANGRE, SUDOR Y CÓDIGO — 2026</p>
    </div>
  </footer>
</template>

<script setup>
// No script needed for now
</script>

<style scoped>
.footer-link {
  color: rgba(250, 204, 21, 0.4);
  font-size: 8px;
  text-decoration: none;
  transition: color 0.2s;
}
.footer-link:hover {
  color: #facc15;
}

.social-icon {
  color: rgba(250, 204, 21, 0.4);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.social-icon:hover {
  color: #facc15;
  transform: translateY(-3px);
  filter: drop-shadow(0 0 5px rgba(250, 204, 21, 0.5));
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
