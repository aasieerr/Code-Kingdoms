import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchCharacter, ensureActiveCharacterId } from '../api/character'
import api from '../api/axios'
import { isPlayerPhpKingdom } from '../utils/realm'
import { normalizeArenaProgressFromServer } from '../composables/arenaCombatShared'

export const useCharacterStore = defineStore('character', () => {
  const gold = ref(0)
  const codeCoins = ref(0)
  const name = ref('')
  const kingdomName = ref('')
  const kingdomId = ref(null)
  const equippedSkin = ref(null)
  const spriteData = ref(null)
  const characterClass = ref('')
  const equippedWeapon = ref(null)
  const level = ref(1)
  const experience = ref(0)
  const maxHealth = ref(100)
  const baseDamage = ref(12)
  const attackPower = ref(10)
  const speed = ref(100)
  const armor = ref(0)
  const statPoints = ref(0)
  const arenaSection = ref(1)
  const arenaWave = ref(1)
  const arenaInProgress = ref(false)
  const loading = ref(false)
  const error = ref(null)

  function pickKingdomName(payload) {
    return (
      payload?.kingdom?.name
      || payload?.kingdom?.realm
      || payload?.kingdom_name
      || payload?.kingdom_realm
      || ''
    )
  }

  async function fetchKingdomNameById(kingdomId) {
    if (!kingdomId) return ''
    try {
      const { data } = await api.get(`/kingdoms/${kingdomId}`, { timeout: 5000 })
      if (Array.isArray(data)) {
        const first = data[0] || {}
        return first.name || first.realm || ''
      }
      return data?.name || data?.realm || ''
    } catch {
      return ''
    }
  }

  async function refresh(retries = 3) {
    loading.value = true
    try {
      const id = await ensureActiveCharacterId()
      if (!id) {
        error.value = 'No active character'
        return
      }

      const ch = await fetchCharacter(id)
      if (!ch) {
        if (retries > 0) {
          setTimeout(() => refresh(retries - 1), 500)
        } else {
          error.value = 'Failed to fetch character'
        }
        return
      }

      gold.value = ch.gold
      codeCoins.value = ch.code_coins ?? 0
      name.value = ch.name
      kingdomId.value = ch.id_kingdom ?? ch.kingdom?.id_kingdom ?? ch.kingdom?.id ?? null
      kingdomName.value = pickKingdomName(ch)
      if (!kingdomName.value && kingdomId.value != null) {
        kingdomName.value = await fetchKingdomNameById(kingdomId.value)
      }
      equippedSkin.value = ch.equipped_skin
      const enemyFactionKey = isPlayerPhpKingdom(kingdomName.value, kingdomId.value) ? 'java' : 'php'
      const migrated = normalizeArenaProgressFromServer(
        enemyFactionKey,
        Number(ch.arena_section ?? 1) || 1,
        Number(ch.arena_wave ?? 1) || 1,
      )
      arenaSection.value = migrated.section
      arenaWave.value = migrated.wave
      arenaInProgress.value = Boolean(ch.arena_in_progress)
      spriteData.value = ch.sprite_data || null
      const classNames = { 1: 'Guerrero', 2: 'Mago', 3: 'Arquero', 4: 'Paladín', 5: 'Asesino' }
characterClass.value = ch.character_class?.name || ch.class?.name || classNames[ch.id_class] || ''
      level.value = Math.max(1, Number(ch.level ?? 1) || 1)
      experience.value = Math.max(0, Math.floor(Number(ch.experience ?? ch.xp ?? 0) || 0))
      maxHealth.value = Math.max(1, Number(ch.max_health ?? ch.maxHealth ?? 100) || 100)
      attackPower.value = Math.max(1, Number(ch.attack_power ?? 10) || 10)
      speed.value = Math.min(200, Math.max(1, Number(ch.speed ?? 100) || 100))
      statPoints.value = Number(ch.stat_points ?? 0) || 0
      arenaSection.value = Number(ch.arena_section ?? 1) || 1
      arenaWave.value = Number(ch.arena_wave ?? 1) || 1
      arenaInProgress.value = Boolean(ch.arena_in_progress)
      
      armor.value = Math.max(0, Number(ch.armor ?? 0) || 0)
      attackSpeed.value = Math.max(0.1, Number(ch.attack_speed ?? ch.attackSpeed ?? 1) || 1)
      moveSpeed.value = Math.max(0.1, Number(ch.move_speed ?? ch.moveSpeed ?? 1) || 1)
      baseDamage.value = Math.max(1, Number(ch.base_damage ?? ch.baseDamage ?? 12) || 12)

      // El backend devuelve equipped_items[] desde la relación equippedItems
      // Buscamos el arma equipada dentro del array
      const equippedWeaponItem = (ch.equipped_items || []).find(i => i.type === 'weapon')
      if (equippedWeaponItem) {
        const details = equippedWeaponItem.weapon || equippedWeaponItem.details || {}
        equippedWeapon.value = {
          name: equippedWeaponItem.name || 'Arma',
          damage: details.damage || 10,
          weaponType: (details.weapon_type || details.weaponType || '').toLowerCase()
        }
      } else {
        equippedWeapon.value = null
      }

      // Buscamos la armadura equipada
      const equippedArmorItem = (ch.equipped_items || []).find(i => i.type === 'armor')
      if (equippedArmorItem) {
        const details = equippedArmorItem.armor || equippedArmorItem.details || {}
        armor.value = Number(details.defense || 0)
      } else {
        armor.value = 0
      }

      error.value = null
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function buyStat(stat) {
    try {
      const id = await ensureActiveCharacterId()
      const { data } = await api.post(`/characters/${id}/upgrade-stat`, { stat })
      if (data.success) {
        await refresh()
        return true
      }
      return false
    } catch (err) {
      console.error('Error buying stat:', err)
      return false
    }
  }

  return {
    gold,
    codeCoins,
    name,
    kingdomName,
    kingdomId,
    characterClass,
    equippedSkin,
    spriteData,
    equippedWeapon,
    level,
    experience,
    maxHealth,
    attackPower,
    speed,
    armor,
    statPoints,
    arenaSection,
    arenaWave,
    arenaInProgress,
    loading,
    error,
    refresh,
    buyStat
  }
})
