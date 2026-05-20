import phpGarbageCollector from '../assets/enemies/php/php-garbage-collector.png'
import phpThreadSpammer from '../assets/enemies/php/php-thread-spammer.png'
import phpBoilerplateGuard from '../assets/enemies/php/php-boilerplate-guard.png'
import phpLegacyMonolith from '../assets/enemies/php/php-legacy-monolith.png'
import phpMicroservice from '../assets/enemies/php/php-microservice.png'
import phpDependencyInjector from '../assets/enemies/php/php-dependency-injector.png'
import phpComposerUpdate from '../assets/enemies/php/php-composer-update.png'
import phpMiniboss from '../assets/enemies/php/php-miniboss.png'

import javaGarbageCollector from '../assets/enemies/java/java-garbage-collector.png'
import javaThreadSpammer from '../assets/enemies/java/java-thread-spammer.png'
import javaBoilerplateGuard from '../assets/enemies/java/java-boilerplate-guard.png'
import javaLegacyMonolith from '../assets/enemies/java/java-legacy-monolith.png'
import javaMicroservice from '../assets/enemies/java/java-microservice.png'
import javaDependencyInjector from '../assets/enemies/java/java-dependency-injector.png'
import javaComposerUpdate from '../assets/enemies/java/java-composer-update.png'
import javaMiniboss from '../assets/enemies/java/java-miniboss.png'

const ARENA_ENEMY_SPRITES = {
  php: {
    garbage_collector: phpGarbageCollector,
    thread_spammer: phpThreadSpammer,
    boilerplate_guard: phpBoilerplateGuard,
    legacy_monolith: phpLegacyMonolith,
    microservice: phpMicroservice,
    dependency_injector: phpDependencyInjector,
    composer_update: phpComposerUpdate,
    miniboss: phpMiniboss,
  },
  java: {
    garbage_collector: javaGarbageCollector,
    thread_spammer: javaThreadSpammer,
    boilerplate_guard: javaBoilerplateGuard,
    legacy_monolith: javaLegacyMonolith,
    microservice: javaMicroservice,
    dependency_injector: javaDependencyInjector,
    composer_update: javaComposerUpdate,
    miniboss: javaMiniboss,
  },
}

export function getArenaEnemySprite(faction, type) {
  return ARENA_ENEMY_SPRITES[faction]?.[type] ?? null
}
