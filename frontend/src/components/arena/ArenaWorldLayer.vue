<script setup>
import { parseSprite, isEmptySprite } from '../../utils/sprite'

defineProps({
  cameraTransform: { type: String, required: true },
  arenaGridStyle: { type: Object, required: true },
  arenaFloorStyle: { type: Object, required: true },
  worldWidthPx: { type: String, required: true },
  worldHeightPx: { type: String, required: true },
  enemies: { type: Array, required: true },
  enemyFactionClass: { type: String, required: true },
  coins: { type: Array, required: true },
  bullets: { type: Array, required: true },
  enemyBullets: { type: Array, required: true },
  slashes: { type: Array, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  moving: { type: Boolean, required: true },
  spriteData: { type: [String, Object, Array], default: null },
  colorStill: { type: String, required: true },
  colorMoving: { type: String, required: true },
  dependencyMark: { type: Object, default: null },
  enemySize: { type: Number, required: true },
  isAndresBoss: { type: Function, required: true },
  bossAndresStyle: { type: Function, required: true },
  isJuanCarlosBoss: { type: Function, required: true },
  isJuanCarlosFlying: { type: Function, required: true },
  isJuanCarlosDefending: { type: Function, required: true },
  bossJuanCarlosImg: { type: Function, required: true },
  bossJuanCarlosStyle: { type: Function, required: true },
  enemySpriteSrc: { type: Function, required: true },
  enemySpriteStyle: { type: Function, required: true },
  hasEnemySprite: { type: Function, required: true },
  hpBarPct: { type: Function, required: true },
  isJavaMiniboss: { type: Function, required: true },
  isPhpMiniboss: { type: Function, required: true },
  enemyBulletClass: { type: Function, required: true },
  enemyBulletImg: { type: Function, required: true },
})
</script>

<template>
  <div
    class="world"
    :style="{
      transform: cameraTransform,
      width: worldWidthPx,
      height: worldHeightPx,
    }"
  >
    <div class="grid" :style="arenaGridStyle"></div>
    <div class="arena-floor" :style="arenaFloorStyle"></div>

    <div
      v-for="e in enemies"
      :key="e.id"
      class="enemy"
      :class="[enemyFactionClass, `enemy-type--${e.type}`, {
        'boss-enemy': e.type === 'boss',
        'boss--andres': isAndresBoss(e),
        'boss--juan-carlos': isJuanCarlosBoss(e),
        'boss--juan-carlos--moving': isJuanCarlosBoss(e) && isJuanCarlosFlying(e),
        'boss--juan-carlos--defending': isJuanCarlosDefending(e),
        'enemy--with-image': hasEnemySprite(e),
      }]"
      :style="{ left: e.x + 'px', top: e.y + 'px', width: (e.size || enemySize) + 'px', height: (e.size || enemySize) + 'px' }"
    >
      <div
        v-if="isAndresBoss(e)"
        class="boss-skin boss-skin--andres"
        :style="bossAndresStyle(e)"
      ></div>
      <img
        v-else-if="isJuanCarlosBoss(e)"
        class="boss-skin boss-skin--juan-carlos"
        :src="bossJuanCarlosImg(e)"
        :style="bossJuanCarlosStyle(e)"
        alt="Juan Carlos"
      >
      <img
        v-else-if="enemySpriteSrc(e)"
        class="enemy-skin"
        :src="enemySpriteSrc(e)"
        :style="enemySpriteStyle(e)"
        :alt="e.type"
      >
      <div
        v-if="e.type === 'boss' || e.type === 'miniboss'"
        class="boss-enemy-hp"
        :class="{
          'boss-enemy-hp--java': isJuanCarlosBoss(e) || isJavaMiniboss(e),
          'boss-enemy-hp--php': isAndresBoss(e) || isPhpMiniboss(e),
        }"
      >
        <div class="boss-enemy-hp-track">
          <div class="boss-enemy-hp-fill" :style="{ width: hpBarPct(e) + '%' }"></div>
        </div>
      </div>
      <span v-else class="enemy-hp" :style="{ width: hpBarPct(e) + '%' }"></span>
    </div>

    <div
      v-for="c in coins"
      :key="c.id"
      class="coin-pickup"
      :style="{ left: c.x + 'px', top: c.y + 'px' }"
    >
      🪙
    </div>

    <div
      v-for="b in bullets"
      :key="b.id"
      class="bullet"
      :style="{ left: b.x + 'px', top: b.y + 'px' }"
    />

    <div
      v-for="b in enemyBullets"
      :key="b.id"
      class="enemy-bullet"
      :class="[enemyBulletClass(b), { 'enemy-bullet--with-sprite': enemyBulletImg(b) }]"
      :style="{ left: b.x + 'px', top: b.y + 'px' }"
    >
      <img
        v-if="enemyBulletImg(b)"
        class="enemy-bullet-skin"
        :src="enemyBulletImg(b)"
        alt=""
      >
      <template v-else>{{ b.symbol }}</template>
    </div>

    <div
      v-for="s in slashes"
      :key="s.id"
      class="slash-container"
      :style="{
        left: s.x + 'px',
        top: s.y + 'px',
        '--angle': (s.angle + Math.PI / 2) + 'rad'
      }"
    >
      <div class="slash-effect"></div>
    </div>

    <div
      class="player"
      :class="{ 'is-moving': moving }"
      :style="{
        left: x + 'px',
        top: y + 'px',
      }"
    >
      <div v-if="spriteData && !isEmptySprite(spriteData)" class="player__sprite">
        <div class="mini-grid">
          <div
            v-for="(color, pIdx) in parseSprite(spriteData)"
            :key="pIdx"
            class="mini-grid__pixel"
            :style="{ backgroundColor: color || 'transparent' }"
          ></div>
        </div>
      </div>
      <div
        v-else
        class="player__fallback"
        :style="{ background: moving ? colorMoving : colorStill }"
      ></div>
      <div
        v-if="dependencyMark"
        class="player__dependency-mark"
        aria-hidden="true"
      ></div>
    </div>
  </div>
</template>

<style scoped src="./ArenaWorldLayer.css"></style>
