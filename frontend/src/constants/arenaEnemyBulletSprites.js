import phpEnemyBullet from '../assets/vfx/php-enemy-bullet.png'
import javaEnemyBullet from '../assets/vfx/java-enemy-bullet.png'
import phpOrb from '../assets/vfx/php-orb.png'
import javaOrb from '../assets/vfx/java-orb.png'

export function getEnemyBulletSprite(bullet) {
  if (!bullet || bullet.isZone) return null
  if (bullet.kind === 'arcane_orb') return phpOrb
  if (bullet.kind === 'java_orb') return javaOrb
  return bullet.faction === 'java' ? javaEnemyBullet : phpEnemyBullet
}
