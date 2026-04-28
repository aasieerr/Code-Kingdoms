import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchCharacter, ensureActiveCharacterId } from '../api/character'

export const useCharacterStore = defineStore('character', () => {
  const gold = ref(0)
  const codeCoins = ref(0)
  const name = ref('')
  const equippedSkin = ref(null)
  const spriteData = ref(null)
  const characterClass = ref('')
  const equippedWeapon = ref(null)
  const loading = ref(false)
  const error = ref(null)

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
      equippedSkin.value = ch.equipped_skin
      spriteData.value = ch.sprite_data || null
      characterClass.value = ch.character_class?.name || ch.class?.name || (ch.id_class === 1 ? 'Guerrero' : '')

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
    characterClass,
    equippedSkin,
    spriteData,
    equippedWeapon,
    loading,
    error,
    refresh
  }
})
