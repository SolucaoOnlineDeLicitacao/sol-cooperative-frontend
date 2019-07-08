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
  .root
    .resource-container(v-if="covenant")
      .card
        .row
          label {{ $t('models.covenant.attributes.number') }}
          span {{ covenant.number }}

        .row
          label {{ $t('models.covenant.attributes.name') }}
          span {{ covenant.name }}

        .row
          label {{ $t('models.covenant.attributes.city') }}
          span {{ covenant.city_text }}

        .row
          label {{ $t('models.covenant.attributes.cooperative') }}
          span {{ covenant.cooperative_name }}

        .row
          label {{ $t('models.covenant.attributes.estimatedCost') }}
          span(v-if="covenant.estimated_cost")
            | {{ $asCurrency(covenant.estimated_cost) }}

        .row
          label {{ $t('models.covenant.attributes.signatureDate') }}
          span {{ covenant.signature_date }}

        .row
          label {{ $t('models.covenant.attributes.validityDate') }}
          span {{ covenant.validity_date }}

        .row
          label {{ $t('models.covenant.attributes.status') }}
          span.badge(:class="covenant.status")
            | {{ $t('models.covenant.attributes.statuses.' + covenant.status) }}

        .row
          label {{ $t('models.covenant.attributes.adminName') }}
          span
            | {{ covenant.admin_name }}
</template>

<script>
  export default {
    name: 'covenant',
    data () {
      return {
        i18nScope: 'covenants.show',
        covenant: null,
        groups: null,
        groupsCount: 0,
        params: null,

        tabs: [
          {
            route: { name: 'covenant', params: {} },
            icon: 'fa-file',
            text: this.$t('covenants.show.tabs.covenant.title'),
            active: true,
          },

          {
            route: { name: 'groups', params: {} },
            icon: 'fa-list',
            text: this.$t('covenants.show.tabs.groups.title'),
            active: false,
          }
        ]
      }
    },

    methods: {
      getCovenant() {
        return this.$http.get('/cooperative/covenants/' + this.params.id)
          .then((response) => {
            this.covenant = response.data

        this.$emit('navbarTitleChanged', this.$t('.navbar.title') + this.covenant.number)

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.params = params
      },

      changeTabs() {
        // add resource id to router tab
        this.tabs[1].route.params = { covenant_id: this.params.id }
        this.$emit('tabChanged', this.tabs)
      }

    },

    created: function () {
      this.parseRoute()
      this.getCovenant()
      this.changeTabs()
    }
  }

</script>
