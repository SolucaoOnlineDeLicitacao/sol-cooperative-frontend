<style scoped lang="scss">
  .used {
    opacity: 0.5;
  }

  .search-field {
    position: relative;

    > .fa {
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 12px;
    }
  }

</style>

<template lang="pug">
  overlay-wnd(v-if="showOverlay", @close="closeOverlay", @open="fetchSearch")
    .container
      h4.mt-2.text-center {{ $t('.title') }}
      hr.mt-0.mb-2.o-container

      form.filter(ref="formSearch", method="get" action="" @submit.prevent="fetchSearch")
        .search-field
          input-field(
            type="text",
            v-model="search",
            name="search",
            :placeholder="$t('.search.placeholder')",
            :hideLabel='true'
          )
          i.fa.fa-search(@click="fetchSearch")

      ul.blink-50(v-if="isLoadingOverlay")
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

      ul(v-else-if="groupItemsCount > 0")
        li.list-item.mb-1.o-container.row(v-for="(group_item) in group_items" @click="addLotGroupItem(group_item)")
          .container(:class="group_item.used ? 'used' : 'not-used'")
            .group-container
              label.inline-block
                | {{ $t('models.group_item.attributes.groupName') }}:
              span  {{ group_item.group_name }}
            .item-container
              label.inline-block
                | {{ $t('models.group_item.attributes.itemName') }}:
              span  {{ group_item.item_name }}

            label.inline-block.list-span.mr-1
              | {{ $t('models.group_item.attributes.quantity') }}:
            span
              | {{ $asNumber(group_item.available_quantity, { precision: 2 }) }} / {{ $asNumber(group_item.quantity, { precision: 2 }) }}
              | {{ group_item.item_unit }}

          .container(v-if="group_item.used")
            .alert.alert-info
              | {{ $t('.already_in_the_current_lot') }}


      ul(v-else)
        li.mb-1
          .container
            | {{ $t('.empty') }}

</template>

<script>
  export default {
    props: {
      showOverlay: { type: Boolean, default: false },
      covenantId: { type: Number },
      lot_group_items: { type: Array }
    },

    data() {
      return {
        i18nScope: 'biddings.lots._form.group_item_list_overlay',
        search: '',
        group_items: null,
        groupItemsCount: 0,
        isLoadingOverlay: true,
      }
    },

    methods: {
      closeOverlay() {
        this.search = ''
        this.$emit('closeOverlay')
      },

      fetchSearch() {
        this.getGroupItems({ search: this.search })
      },

      getGroupItems(oParams) {
        this.isLoadingOverlay = true

        let params = oParams

        return this.$http.get('/cooperative/covenants/' + this.covenantId + '/group_items', { params })
          .then((response) => {
            this.group_items = response.data
            this.groupItemsCount = this.group_items.length

            let activeLotGroupItems = this.lot_group_items.filter((item) => {
              if(!item._destroy) {
                return item
              }
            })

            let ids = _.map(activeLotGroupItems, 'group_item_id')

            this.group_items.filter((item) => {
              if(_.includes(ids, item.id)) {
                item.used = true
              }else {
                item.used = false
              }
            })

            this.isLoadingOverlay = false

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })

      },

      addLotGroupItem: function(group_item) {
        let alreadyAdd = false
        let wasDestroyedIndex = -1
        let currentItem = group_item

        this.closeOverlay()

        this.lot_group_items.filter(function(elem, index){
          if(elem.group_item_id == currentItem.id) {
            if(elem._destroy) {
              elem._destroy = false
              wasDestroyedIndex = index
            } else {
              alreadyAdd = true
            }
          }
        });

        if(!alreadyAdd) {
          let addParams = {
            group_item_id: currentItem.id,
            item_name: currentItem.item_name,
            item_short_name: currentItem.item_short_name,
            item_unit: currentItem.item_unit,
            quantity: null,
            available_quantity: currentItem.available_quantity,
            total_quantity: currentItem.quantity,
            _destroy: false
          }

          if (wasDestroyedIndex >= 0) {
            this.lot_group_items.splice(wasDestroyedIndex, 1)
          }

          this.lot_group_items.push(addParams)
        }
      },
    },


  }
</script>
