import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchCharacter, ensureActiveCharacterId } from '../api/character'
import api from '../api/axios'

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
      spriteData.value = ch.sprite_data || null
      characterClass.value = ch.character_class?.name || ch.class?.name || (ch.id_class === 1 ? 'Guerrero' : '')
      arenaSection.value = Number(ch.arena_section ?? 1) || 1
      arenaWave.value = Number(ch.arena_wave ?? 1) || 1
      arenaInProgress.value = Boolean(ch.arena_in_progress)

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

      error.value = null
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
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
    arenaSection,
    arenaWave,
    arenaInProgress,
    loading,
    error,
    refresh
  }
})
