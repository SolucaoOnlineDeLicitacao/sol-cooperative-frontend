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
  overlay-wnd(v-if="showGroupOverlay", @close="closeGroupOverlay", @open="fetchSearch")
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

      ul(v-else-if="groupsCount > 0")
        li.list-item.mb-1.o-container.row(v-for="(group) in groups" @click="addGroupItems(group)")
          .container(:class="group.used ? 'used' : 'not-used'")
            .group-container
              label.inline-block
                | {{ $t('models.group.attributes.name') }}:
              span  {{ group.name }}
            label.inline-block.list-span
              | {{ $t('models.group.attributes.group_items_count') }}:
            span
              | {{ group.group_items_count }}

            .item-container
              label.inline-block.list-span
                | {{ $t('models.group.attributes.items_added') }}:
              span
                | {{ group.items_added }}

          .container(v-if="group.used")
            .alert.alert-info
              template(v-if="group.items_not_available")
                | {{ $t('.items_not_available') }}
              template(v-else)
                | {{ $t('.already_in_the_current_lot') }}


      ul(v-else)
        li.mb-1
          .container
            | {{ $t('.empty') }}

</template>

<script>
  export default {
    props: {
      showGroupOverlay: { type: Boolean, default: false },
      covenantId: { type: Number },
      lot_group_items: { type: Array }
    },

    data() {
      return {
        i18nScope: 'biddings.lots._form.group_list_overlay',
        search: '',
        groups: null,
        groupsCount: 0,
        isLoadingOverlay: true,
      }
    },

    methods: {
      closeGroupOverlay() {
        this.search = ''
        this.$emit('closeGroupOverlay')
      },

      fetchSearch() {
        this.getGroups({ search: this.search })
      },

      getGroups(oParams) {
        this.isLoadingOverlay = true

        let params = oParams

        return this.$http.get('/cooperative/covenants/' + this.covenantId + '/groups', { params })
          .then((response) => {
            this.groups = response.data.filter((group) => {
              return group.group_items_count > 0
            })
            this.groupsCount = this.groups.length

            for(let [index, group] of this.groups.entries()) {
              let currentGroupLength = 0;
              let removedGroupLength = 0;

              this.lot_group_items.filter((lot_group_item) => {
                if (lot_group_item.group_id == group.id) { 
                  lot_group_item._destroy ? removedGroupLength++ : currentGroupLength++
                }
              })

              let availableGroupItemsLength = group.group_items.filter((group_item) => {
                return group_item.available_quantity > 0
              }).length

              this.groups[index].items_added = `${currentGroupLength}/${group.group_items_count}`

              // only for lot edit, because when editing lot we have to consider current items length
              if(this.$route.params.id) {
                availableGroupItemsLength = availableGroupItemsLength + (removedGroupLength + currentGroupLength)
              }

              if(availableGroupItemsLength == 0 && currentGroupLength <= 0) {
                this.groups[index].used = true
                this.groups[index].items_not_available = true
              } else {
                if(removedGroupLength > 0) {
                  this.groups[index].used = false
                } else {
                  if(currentGroupLength == group.group_items_count || currentGroupLength >= availableGroupItemsLength) {
                    this.groups[index].used = true
                  } else {
                    this.groups[index].used = false
                  }
                }
                this.groups[index].items_not_available = false
              }
            }

            this.isLoadingOverlay = false

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })

      },

      addGroupItems: function(group) {
        return this.$http.get('/cooperative/covenants/' + group.covenant_id + '/group_items')
          .then((response) => {
            let groupItems = response.data.filter((groupItem) => {
              return groupItem.group_id == group.id
            })

            for(let currentItem of groupItems) {
              let alreadyAdd = false

              this.closeGroupOverlay()

              this.lot_group_items.filter(function(elem, index){
                if(elem.group_item_id == currentItem.id) {
                  alreadyAdd = true

                  if(elem._destroy) {
                    elem._destroy = false
                  }
                }
              });

              if(!alreadyAdd) {
                let addParams = {
                  group_item_id: currentItem.id,
                  item_name: currentItem.item_name,
                  item_short_name: currentItem.item_short_name,
                  item_unit: currentItem.item_unit,
                  quantity: currentItem.available_quantity,
                  available_quantity: currentItem.available_quantity,
                  total_quantity: currentItem.quantity,
                  group_id: currentItem.group_id,
                  _destroy: false
                }

                if (currentItem.available_quantity > 0) {
                  this.lot_group_items.push(addParams)
                }
              }
            }

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },
    },


  }
</script>
