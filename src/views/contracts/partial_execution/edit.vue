<style scoped lang="scss">
  .item-quantity-container {
    line-height: 40px;

    .input-field {
      float: right;
      min-width: 20%;
      max-width: 40%;
    }

    .error {
      line-height: 20px;
    }
  }

  .item-container {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;

      hr {
        display: none;
      }
    }
  }
</style>

<template lang="pug">
  .root
    .container.contract.mt-2(v-if="group_items")
      form(ref="form", method="patch", @submit.prevent="submit")
        template(v-if="group_items")
          .card.mb-2.u-cf(v-for="(group_item, key) in group_items")
            h4 {{ group_item[0].lot_name }}

            hr.mt-0.mb-2.o-container

            .u-cf.item-container(v-for="(item) in group_item", v-if="item")
              div
                label.inline-block.mr-0-5.list-span
                  | {{ $t('.item.title') }}:
                span
                  | {{ item.item_name }}
                  | {{ item.index }}

              div
                label.inline-block.mr-0-5.list-span
                  | {{ $t('.item.total_quantity') }}:
                span
                  | {{ $asNumber(item.quantity, { precision: 2 }) }}
                  | {{ item.item_unit }}

              .item-quantity-container.mb-2.u-cf
                span.mr-0-5
                  | {{ $t('.item.total_delivered') }}:

                input(type="hidden", name="contract[returned_lot_group_items_attributes][][lot_group_item_id]", :value="item.id")

                numeric-field.mb-0.mr-0-5(
                  v-model="item.returned_lot_group_item_quantity",
                  name="contract[returned_lot_group_items_attributes][][quantity]",
                  :hideLabel="true",
                  :error="errors[item.index] && errors[item.index]['quantity']"
                )

              hr.mt-0.mb-0.o-container

        button.button-primary.u-full-width(
          type="submit",
          :disabled="submitting"
        )
          | {{ submitText }}
</template>


<script>

  export default {
    name: 'editPartialExecutionContract',

    props: {
      redirect: { type: String }
    },

    data () {
      return {
        i18nScope: 'contracts.partial_execution.edit',
        submitting: false,
        errors:  {},

        tabs: [],

        // form
        contract: {},
        group_items: []
      }
    },

    computed: {
      submitText() {
        if (this.submitting) return this.$t('.button.submitting')
        return this.$t('.button.submit')
      }
    },

    methods: {
      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.patch('/cooperative/contracts/' + this.params.id + '/partial_execution', formData)
          .then((response) => {
            this.$notifications.clear()

            this.errors = {}

            this.$notifications.info(this.$t('.notifications.success'))

            let redirectToRoute = { name: 'contract', params: { id: this.params.id } }
            this.$router.replace(redirectToRoute)
          })
          .catch((err) => {

            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.$notifications.error(this.$t('.notifications.failure'))

            this.errors = {}

            for(let i = 0; i < errors.returned_lot_group_items_errors.length; i++) {
              this.errors[i] = this.$i18n.errify(errors.returned_lot_group_items_errors[i], { model: 'lot_group_item' })
            }

          })
          .then(() => {
            this.submitting = false
          })

      },

      getContract() {
        return this.$http.get('/cooperative/contracts/' + this.params.id)
          .then((response) => {
            this.contract = response.data

            this.$emit('navbarTitleChanged', this.contract.title)

            this.getContractItens();

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },


      getContractItens() {
        return this.$http.get('/cooperative/contracts/' + this.params.id + '/items')
          .then((response) => {
            let orderedItens = _.orderBy(response.data, ['lot_id'])
            let index = 0

            _.map(orderedItens, function(item) {
              item.index = index
              item.returned_lot_group_item_quantity = null
              index++
            })

            this.group_items = _.groupBy(orderedItens, 'lot_id')

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
        this.$emit('tabChanged', this.tabs)
      },
    },

    created: function () {
      this.parseRoute()
      this.getContract()
      this.changeTabs()

      this.index = 0
    }
  }

</script>
