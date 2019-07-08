<style scoped lang="scss">
</style>

<template lang="pug">
  .root
    .container.bidding.mt-2
      form(ref="form", method="post", @submit.prevent="submit")

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
  import ItemsFields from './_form/items-fields'
  import FilesFields from './_form/files-fields'

  export default {
    name: 'newLot',

    components: {
      LotFields,
      ItemsFields,
      FilesFields
    },

    data () {
      return {
        i18nScope: 'biddings.lots.new',
        params: {},

        bidding: null,
        biddingId: null,

        // form
        lot: {},
        lot_group_items: [],
        attachments: [],
        errors: { lot_group_items_errors: {} },
        submitting: false,

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

      submit() {
        const formData = new FormData(this.$refs.form)
        this.submitting = true

        this.$http.post('/cooperative/biddings/' + this.biddingId + '/lots', formData)
          .then((response) => {
            this.$notifications.clear()

            this.errors = {}

            let redirectToRoute = this.redirect ? { path: this.redirect } : { name: 'lots', params: { bidding_id: this.biddingId } }
            this.$router.replace(redirectToRoute)
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
    }
  }

</script>
