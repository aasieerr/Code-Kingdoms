<template>
  <footer class="relative z-40 px-6 pt-20 pb-12 mt-20"
    style="border-top: 5px solid #facc15; background: #0b0d17; box-shadow: 0 -5px 0 #854d0e;">
    
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-20 text-left">
      <!-- Brand -->
      <div class="flex flex-col gap-6">
        <div class="flex items-center gap-4">
          <img src="/code-kingdoms-logo.png" alt="logo" width="48" height="48">
          <span class="text-[#facc15] text-[10px] tracking-widest">CODE & KINGDOMS</span>
        </div>
        <p class="text-[#facc15]/30 text-[8px] leading-7 italic">"EL COMPILADOR JUZGARÁ TUS ACTOS."</p>
        <div class="flex gap-3">
          <div class="w-8 h-8 border-2 border-[#3b82f6] bg-[#3b82f6]/10 flex items-center justify-center cursor-pointer">
            <div class="w-2 h-2 bg-[#3b82f6]"></div>
          </div>
          <div class="w-8 h-8 border-2 border-[#ef4444] bg-[#ef4444]/10 flex items-center justify-center cursor-pointer">
            <div class="w-2 h-2 bg-[#ef4444]"></div>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-2 gap-8">
        <div class="flex flex-col gap-5">
          <h4 class="text-[#facc15] text-[9px] mb-2 underline decoration-2 underline-offset-8">JUEGO</h4>
          <router-link to="/" class="footer-link">MUNDO</router-link>
          <router-link to="/comunidad" class="footer-link">COMUNIDAD</router-link>
          <router-link to="/login" class="footer-link">HEROES</router-link>
        </div>
        <div class="flex flex-col gap-5">
          <h4 class="text-[#facc15] text-[9px] mb-2 underline decoration-2 underline-offset-8">LEGAL</h4>
          <a href="#" class="footer-link">PRIVACIDAD</a>
          <a href="#" class="footer-link">TÉRMINOS</a>
        </div>
      </div>

      <!-- Status -->
      <div class="p-6 border-2 border-[#facc15]/10 bg-[#0a0c14]">
        <h4 class="text-[#facc15] text-[8px] mb-6">ESTADO DEL REINO</h4>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 uppercase">Servidores</span>
            <span class="text-[#4ade80] text-[7px] animate-pulse">● ONLINE</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[7px] text-[#facc15]/40 uppercase">Versión</span>
            <span class="text-[#facc15]/60 text-[7px]">v2.4.0-GOLD</span>
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

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
