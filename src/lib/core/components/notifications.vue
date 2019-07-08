<!--
<doc lang="markdown">
    Container de notificações (alertas) para feedback visual ao usuário.
    Integra-se ao módulo `notifications.js`, respondendo aos eventos de
  notificação com feedback visual.
</doc>
-->

<style scoped lang="scss">

</style>


<template lang="pug">
  transition-group(name="fade", tag="div", mode="out-in")
    .alert.alert-dismissible.alert-danger(
      v-for="{ message, key } in notifications.error",
      :key="key",
      role="alert"
    )
      button.close(type="button", :aria-label="$t('close')", @click="dismissError(message)") ×
      span.content {{ message }}

    .alert.alert-dismissible.alert-info(
      v-for="{ message, key } in notifications.info",
      :key="key",
      role="alert"
    )
      button.close(type="button", :aria-label="$t('close')", @click="dismissInfo(message)") ×
      span.content {{ message }}

    .alert.alert-dismissible.alert-warning(
      v-for="{ message, key } in notifications.warning",
      :key="key",
      role="alert"
    )
      button.close(type="button", :aria-label="$t('close')", @click="dismissWarning(message)") ×
      span.content {{ message }}
</template>


<script>
  const ERROR_DISMISS_TIMEOUT = 10000
  const WARNING_DISMISS_TIMEOUT = 8000
  const INFO_DISMISS_TIMEOUT = 5000


  function dismissTimeoutFor(level) {
    switch (level) {
      case 'error': {
        return ERROR_DISMISS_TIMEOUT
      }

      case 'warning': {
        return WARNING_DISMISS_TIMEOUT
      }

      case 'info':
      default: {
        return INFO_DISMISS_TIMEOUT
      }
    }
  }


  export default {
    data() {
      return {
        notifications: {
          error:   [],
          info:    [],
          warning: []
        }
      }
    },

    created() {
      app.$on('notifications:clear', this.clear)
      app.$on('notifications:info', this.appendInfo)
      app.$on('notifications:error', this.appendError)
      app.$on('notifications:warning', this.appendWarning)

      this.parseFlashData()
    },

    beforeDestroy() {
      app.$off('notifications:clear', this.clear)
      app.$off('notifications:info', this.appendInfo)
      app.$on('notifications:error', this.appendError)
      app.$off('notifications:warning', this.appendWarning)
    },

    methods: {
      append(level, message, dismiss = true) {
        let notifications = this.notifications[level]

        // Caso a notificação já exista, remova-a antes de adicionar uma "réplica"
        if (notifications.findIndex(notification => notification.message === message) !== -1) {
          this.$nextTick(() => { this.dismiss(level, message) })
        }

        // Para que seja "removível" corretamente, precisamos criar uma 'key'
        // baseada no tempo, para que o `v-for` use-a corretamente!
        let notification = {
          message,
          key:     `${message}-${Date.now()}`,
          timeout: null
        }

        if (dismiss) {
          notification.timeout = setTimeout(() => {
            this.dismiss(level, message)
          }, dismissTimeoutFor(level))
        }

        notifications.push(notification)
      },

      appendError(...args) {
        this.append('error', ...args)
      },

      appendInfo(...args) {
        this.append('info', ...args)
      },

      appendWarning(...args) {
        this.append('warning', ...args)
      },

      clear() {
        Object.keys(this.notifications).forEach((level) => { this.notifications[level] = [] })
      },

      dismiss(level, message) {
        let notifications = this.notifications[level]
        let idx = notifications.findIndex(notification => notification.message === message)

        if (idx !== -1) {
          let notification = notifications[idx]
          if (notification.timeout) clearTimeout(notification.timeout)

          notifications.splice(idx, 1)
        }
      },

      dismissError(...args) {
        this.dismiss('error', ...args)
      },

      dismissInfo(...args) {
        this.dismiss('info', ...args)
      },

      dismissWarning(...args) {
        this.dismiss('warning', ...args)
      },

      /**
       * Interface entre mensagens de notificação "navegacionais" do backend (Rails) via flash.
       * O conteúdo fica em um <meta>, ex:
       * ```html
       * <meta content="[['notice','test-notice'],['alert','test-alert']]" name="flash-data">
       * ````
       * @return {[type]} [description]
       */
      parseFlashData() {
        let data = app.dom.fetchMetaJSON('flash-data') || []

        data.forEach((entry) => {
          let flashLevel = entry[0]
          let flashMessage = entry[1]

          switch (flashLevel) {
            case 'error': {
              this.appendError(flashMessage)
              break
            }

            case 'alert': {
              this.appendWarning(flashMessage)
              break
            }

            case 'notice':
            default: {
              this.appendInfo(flashMessage)
              break
            }
          }
        })
      }
    }
  }
</script>
