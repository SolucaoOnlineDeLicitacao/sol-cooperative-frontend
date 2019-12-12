<style scoped lang="scss">
</style>

<template lang="pug">
  .mt-2(v-if="group")
    .container
      .card.slim
        .container
          h4.mt-1.mb-1 {{ group.name }}

        hr.mt-0.mb-2

        ul.mb-0(v-if="group_items")
          li.list-item.mb-1.row(v-for="(group_item) in group_items" @click="toggleOverlay(group_item)")
            .container
              .list-title.mb-1 {{ group_item.item_short_name }}
              div.list-span
                label.mr-0-5.mb-0.inline-block
                  | {{ $t('models.group_item.attributes.quantity') }}:
                span
                  | {{ $asNumber(group_item.quantity, { precision: 2 }) }} 

              div.list-span
                label.mr-0-5.inline-block
                  | {{ $t('models.group_item.attributes.estimated_cost') }}:
                span
                  | {{ $asCurrency(group_item.estimated_cost) }}

        ul.mb-0.blink-50(v-else)
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


    overlay-wnd(v-if="showOverlay", @close="showOverlay = false")
      .container(v-if="overlayItem")
        h4.mt-2.text-center {{ $t('.overlay.title') }}
        hr.mt-0.mb-2.o-container

        h4 {{ this.overlayItem.item_short_name }}

        label.mr-0-5.mt-2
          | {{ $t('models.group_item.attributes.quantity') }}:
        span
          | {{ $asNumber(this.overlayItem.quantity, { precision: 2 }) }} 

        label.mr-0-5.mt-2
          | {{ $t('models.group_item.attributes.estimated_cost') }}:
        span
          | {{ $asCurrency(this.overlayItem.estimated_cost) }}

        label.mr-0-5.mt-2
          | {{ $t('models.group_item.attributes.itemName') }}:
        span
          | {{ this.overlayItem.item_name }}


</template>


<script>
  import view from '@/view.vue'

  export default {
    name: 'group',
    data () {
      return {
        i18nScope: 'groups.show',
        showOverlay: false,
        overlayItem: {},
        group: null,
        group_items: null,
        params: null
      }
    },

    methods: {
      getGroup() {
        return this.$http.get('/cooperative/covenants/' + this.covenantId + '/groups/' + this.$route.params.id)
          .then((response) => {
            this.group = response.data
            this.group_items = response.data.group_items || []

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

      toggleOverlay(item) {
        this.overlayItem = item
        this.showOverlay = true
      }

    },

    created: function () {
      this.parseRoute()
      this.getGroup()
    }
  }

</script>
