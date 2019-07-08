<style scoped lang="scss">
</style>

<template lang="pug">
  .container
    .card.mt-2
      h4 {{ $t('.title') }}

      hr.mt-2.mb-2.o-container

      ul.mb-0.blink-50(v-if="isLoading")
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

      ul.mb-0(v-else-if="groupsCount")
        li.list-item.o-container.row(v-for="(group) in groups")
          router-link(:to="{ name: 'group', params: { covenant_id: group.covenant_id, id: group.id } }")
            .container
              .list-title
                | {{ group.name }}
              span.mr-1
                | {{ $t('.group_items_count', { value: group.group_items_count }) }}

              span.mr-1
                | Valor: {{ $asCurrency(group.group_items_value_count) }}

      ul(v-else)
        li.list-item.mb-1
          .container
            | {{ $t('.empty') }}
</template>

<script>
  export default {
    name: 'groups',
    data () {
      return {
        i18nScope: 'groups.index',

        // resource
        isLoading: true,
        groups: null,
        groupsCount: null,
        params: {}
      }
    },

    methods: {
      fetch() {
        let params = this.params

        this.isLoading = true

        return this.$http.get('/cooperative/covenants/' + this.covenantId + '/groups', { params })
          .then((response) => {
            this.groups = response.data
            this.groupsCount = this.groups.length

            this.isLoading = false

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.covenantId = this.$params.asInteger(this.$route.params.covenant_id)

        this.params = params
      },

      init() {
        this.parseRoute()
        this.fetch()
      }
    },

    created: function () {
      this.init();
    },

  }

</script>
