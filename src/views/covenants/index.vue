<style scoped lang="scss">
  .badge {
    &.waiting {
      background-color: $greyish-brown;
    }

    &.canceled {
      background-color: $danger-color;
    }

    &.completed {
      background-color: $apple-green;
    }
  }

</style>


<template lang="pug">
  .mt-2(v-if="covenants")
    ul
      li.list-item.row(v-for="(covenant) in covenants")
        router-link(:to="{ name: 'covenant', params: { id: covenant.id } }")
          .container
            .card
              .list-text
                h5.mb-1 {{ covenant.name }}
                div
                  label.mr-0-5.inline-block
                    | {{ $t('models.covenant.attributes.number') }}:
                  | {{ covenant.number }}

                div
                  label.mr-0-5.inline-block
                    | {{ $t('models.covenant.attributes.status') }}:
                  span.badge(:class="covenant.status")
                    | {{ $t('models.covenant.attributes.statuses.' + covenant.status) }}

  .blink-50.mt-2(v-else)
    ul
      li.list-item.mb-1
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x
      li.list-item.mb-1.loading-2
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x

      li.list-item.mb-1.loading-3
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x

      li.list-item.mb-1.loading-4
        .container
          .list-title
          i.fas.fa-spinner.fa-pulse.fa-2x

</template>

<script>
  export default {
    name: 'covenants',
    data () {
      return {
        i18nScope: 'covenants.index',

        // resource
        covenants: null,
        covenantsCount: null,
        params: {},

        tabs: [],
      }
    },

    methods: {
      fetch() {
        let params = this.params

        return this.$http.get('/cooperative/covenants', { params })
          .then((response) => {
            this.covenants = response.data
            this.covenantsCount = this.covenants.length

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      init() {
        this.fetch()
      }
    },

    created: function () {
      this.$emit('tabChanged', this.tabs)
      this.$emit('navbarTitleChanged', this.$t('.title'))

      this.init();
    },

  }

</script>
