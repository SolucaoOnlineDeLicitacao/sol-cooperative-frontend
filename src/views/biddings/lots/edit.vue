<style scoped lang="scss">
  .error {
    line-height: 16px;
  }
</style>

<template lang="pug">
  .root
    .container.bidding.mt-2
      form(ref="form", method="patch", @submit.prevent="submit")

        lot-fields(:lot="lot", :errors="errors")

        items-fields(:bidding="bidding", :lot_group_items="lot_group_items", :errors="errors")

        files-fields(:attachments="attachments")

        button.button-submit.u-full-width.mt-2(
          type="submit",
          :disabled="submitting"
        )
          | {{ submitText }}

</template>


<script>
  import LotFields from './_form/lot-fields'
  import FilesFields from './_form/files-fields'
  import ItemsFields from './_form/items-fields'

  export default {
    name: 'editLot',

    components: {
      LotFields,
      FilesFields,
      ItemsFields
    },

    data () {
      return {
        i18nScope: 'biddings.lots.edit',
        params: {},

        bidding: null,
        biddingId: null,

        // form
        lot: {},
        lot_group_items: [],
        submitting: false,
        errors: { lot_group_items_errors: {} },
        attachments: [],

        tabs: [],
      }
    },

    computed: {
      submitText() {
        if (this.submitting) return this.$t('.button.submitting')
        return this.$t('.button.submit')
      },
    },

    methods: {
      updateActiveTab(index) {
        _.map(this.internalTabs, function(tab){ tab.active = false });
        this.internalTabs[index]['active'] = true
      },

      getBidding() {
        return this.$http.get('/cooperative/biddings/' + this.biddingId)
          .then((response) => {
            this.bidding = response.data

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      getLot() {
        return this.$http.get('/cooperative/biddings/' + this.biddingId + '/lots/' + this.$route.params.id)
          .then((response) => {
            this.lot = response.data
            this.lot_group_items = response.data.lot_group_items || []

            this.attachments = response.data.attachments.map(function(attachment) {
                return {
                  id: attachment.id,
                  url: attachment.url,
                  filename: attachment.filename,
                  visible: true
                }
            })

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.patch('/cooperative/biddings/' + this.biddingId + '/lots/' + this.lot.id, formData)
          .then((response) => {
            this.$notifications.clear()
            this.errors = {}

            this.$router.replace({ name: 'lot', params: { bidding_id: this.biddingId, id: this.lot.id } })
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.$notifications.error(this.$t('.notifications.failure'))
            this.errors = this.$i18n.errify(errors, { model: 'bidding' })

            for(let i = 0; i < errors.lot_group_items_errors.length; i++) {
              errors.lot_group_items_errors[i] = this.$i18n.errify(errors.lot_group_items_errors[i], { model: 'lot_group_item' })
            }

            this.errors.lot_group_items_errors = errors.lot_group_items_errors
          })
          .then(() => {
            this.submitting = false
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)

        this.params = params
      },

      changeTabs() {
        this.$emit('tabChanged', this.tabs)
      },
    },

    created: function () {
      this.changeTabs()
      this.parseRoute()
      this.getBidding()
      this.getLot()
    }
  }

</script>
