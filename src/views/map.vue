<template lang="pug">
  ll-map(:markers="markers" :classes='loadingClasses')
</template>

<script>

  export default {
    name: 'map',
    data () {
      return {
        i18nScope: 'map',
        markers: null,
        loadingClasses: '',
        tabs: []
      }
    },

    methods: {
      fetchDashboard() {
        return this.$http.get('/cooperative/map')
          .then((response) => {
            this.markers = response.data.markers

            this.loadingClasses = ''
          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      }
    },

    created: function () {
      this.$emit('tabChanged', this.tabs)
      this.$emit('navbarTitleChanged', this.$t('title'))

      this.fetchDashboard()
    }
  }
</script>

<style scoped lang="scss">
</style>
