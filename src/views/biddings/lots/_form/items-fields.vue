<style scoped lang="scss">
  .error {
    line-height: 16px;
  }

  .list-item-input,
  .list-item-action {
    float: left;
    margin-right: 4%;
    width: 38%;

    line-height: 38px;
  }

  .list-item-input {
    margin-right: 0;
    position: relative;
    width: 58%;

    .list-item-quantity {
      position: absolute;
      right: 20px;
      top: 0;
    }
  }

  .max {
    color: $danger-color;
  }

  .fa-info-circle {
    color: $primary-color;
  }

  .icon-button {
    padding: 0 12px;
    height: 28px;
    line-height: 28px;
    margin-right: 10px;
  }

  .input-file {
    float: left;
    max-width: 80%;
  }

</style>

<template lang="pug">
  .root
    .card.mt-2
      h4.mb-1 {{ $t('.items.title') }}
      hr.mt-0.mb-1.o-container

      .button.u-full-width.button-add-item(@click="toggleOverlay" v-if="! hideAddItemButton")
        | {{ $t('.items.buttons.add') }}

      div.alert.alert-danger.mb-2(v-if="errors.lot_group_items")
        | {{ errors.lot_group_items }}. {{ $t('.items.alerts.minimum') }}

      ul.mt-2.mb-0(v-if="lot_group_items.length > 0")
        li.list-item.row(v-for="(lot_group_item, index) in lot_group_items" v-if="!lot_group_item._destroy")
          div(:class="maxQuantity(lot_group_item) ? 'max' : ''")
            .list-item-name(@click="toggleOverlayInfo(lot_group_item)")
              i.fa.fa-info-circle.mr-1
              | {{ lot_group_item.item_short_name }} - {{ lot_group_item.item_unit }}
              input(type="hidden", name="lot[lot_group_items_attributes][][id]", :value="lot_group_item.id" v-if="lot_group_item")
              input(type="hidden", name="lot[lot_group_items_attributes][][_destroy]", :value="lot_group_item._destroy" v-if="lot_group_item")

              input(type="hidden", name="lot[lot_group_items_attributes][][group_item_id]", :value="lot_group_item.group_item_id" v-if="lot_group_item")

            .list-item-action.text-center(@click="removeGrupItem(lot_group_item)")
              .button.button-destroy.u-full-width
                | {{ $t('.items.buttons.remove') }}

            .list-item-input
              numeric-field(
                v-model="lot_group_item.quantity",
                name="lot[lot_group_items_attributes][][quantity]",
                :error="lotGroupItemErrors[index] && lotGroupItemErrors[index]['quantity']",
                :hideLabel="true",
              )

              span.list-item-quantity / {{ $asNumber(lot_group_item.available_quantity, { precision: 2 }) }}

        li(v-else)
          input(type="hidden", name="lot[lot_group_items_attributes][][id]", :value="lot_group_item.id" v-if="lot_group_item")
          input(type="hidden", name="lot[lot_group_items_attributes][][_destroy]", :value="lot_group_item._destroy" v-if="lot_group_item")

    group-item-overlay(:showOverlay="showOverlayInfo", :overlayItem="overlayItem", @closeOverlay="showOverlayInfo = false")

    group-item-list-overlay(:showOverlay="showOverlay", :covenantId="covenantId", :lot_group_items="lot_group_items", @closeOverlay="showOverlay = false")

</template>

<script>
  import GroupItemListOverlay from './group-item-list-overlay'
  import GroupItemOverlay from './group-item-overlay'

  export default {
    props: {
      bidding: { type: Object },
      lot_group_items: { type: Array },
      errors: { type: Object, default: () => {} },

    },

    components: {
      GroupItemListOverlay,
      GroupItemOverlay
    },

    data() {
      return {
        i18nScope: 'biddings.lots._form.items-fields',
        showOverlayInfo: false,
        overlayItem: null,
        showOverlay: false,
      }
    },

    computed: {
      hideAddItemButton() {
        return (this.bidding && this.bidding.kind == 'unitary' && this.countActiveLotGroupItems >= 1) || this.nullCovenant
      },

      covenantId() {
        return this.bidding && this.bidding.covenant_id
      },

      nullCovenant() {
        return this.covenantId == null
      },

      countActiveLotGroupItems() {
        let counter = 0
        this.lot_group_items.filter(function(elem, index){
          if(!elem._destroy) {
            counter++
          }
        });

        return counter
      },

      lotGroupItemErrors() {
        return this.errors.lot_group_items_errors
      }
    },

    methods: {
      removeGrupItem(lot_group_item) {
        let currentItem = lot_group_item

        this.lot_group_items.filter(function(elem){
          if(elem.group_item_id == currentItem.group_item_id) {
            elem._destroy = true
          }
        })
      },

      maxQuantity(lot_group_item) {
        return this.commaToFloat(lot_group_item.quantity) > this.currentAvailableQuantity(lot_group_item)
      },

      currentAvailableQuantity(lot_group_item) {
        let quantity = this.commaToFloat(lot_group_item.available_quantity) + this.commaToFloat(lot_group_item.current_quantity || 0)

        return this.commaToFloat(quantity)
      },

      commaToFloat(value) {
        if(value !== null) {
          return parseFloat(value.toString().replace(',', '.'))
        }
      },

      toggleOverlayInfo(item) {
        this.overlayItem = item
        this.overlayItem.maxQuantity = this.maxQuantity(item)

        this.showOverlayInfo = true
      },

      toggleOverlay() {
        this.showOverlay = true
      },

    }
  }

</script>
