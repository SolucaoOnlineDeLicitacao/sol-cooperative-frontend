<style scoped lang="scss">
  .badge {
    &.waiting {
      background-color: $apple-green;
    }
  }

  .list-span {
    font-size: 12px;
  }

  .attachment-name {
    max-width: 90%;
    word-break: break-all;
  }
</style>

<template lang="pug">
  .mt-2(v-if="lot")
    .container
      template(v-if="showProposalsButton")
        router-link.mb-2.button.button-primary.router-link.u-full-width.mb-0(:to="{ name: 'proposals', params: { bidding_id: this.biddingId, lot_id: lot.id } }")
          | {{ this.$t('.button.proposals') }}

      .card.slim
        .container
          h4.mt-1.mb-1 {{ lot.title }}

        hr.mt-0.mb-2

        ul.mb-0(v-if="lot_group_items")
          li.list-item.row(v-for="(lot_group_item) in lot_group_items" @click="toggleOverlay(lot_group_item)")
            .container
              .list-title {{ lot_group_item.item_short_name }}
              label.mr-0-5.inline-block.list-span
                | {{ $t('models.group_item.attributes.quantity') }}:
              span
                | {{ $asNumber(lot_group_item.quantity, { precision: 2 }) }}
                | {{ lot_group_item.item_unit }}

        ul.blink-50(v-else)
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

      .card.mt-2.slim(v-if="lot && lot.attachments.length > 0")
        .container
          h5.mt-1.mb-1 {{ $t('.files.title') }}

        hr.mt-0.mb-2

        .container
          ul.mb-0
            li.row(v-for="attachment in lot.attachments")
              a.input-file.mb-1(:href="attachmentPath(attachment)", target="_blank")
                i.fa.fa-download.mr-1.u-pull-left
                span.attachment-name.u-pull-left {{ attachment.filename }}


    .text-center.mb-2.mt-2(v-if="lot.bidding_status == 'draft'")
      router-link.button.button-primary.router-link(:to="{ name: 'editLot', params: { bidding_id: this.biddingId, id: this.lot.id } }")
        | {{ $t('.edit') }}

      .button.button-danger.ml-1(@click="destroyDialog(lot.id)")
        | {{ $t('.destroy.button') }}

    lot-group-item-overlay(:showOverlay="showOverlay", :overlayItem="overlayItem", @closeOverlay="showOverlay = false")

</template>

<script>
  export default {
    name: 'lot',
    data () {
      return {
        i18nScope: 'biddings.lots.show',
        lot: null,
        lot_group_items: null,
        params: null,

        showOverlay: false,
        overlayItem: {},

        bidding_status: null,
        bidding_modality: null,
        bidding_kind: null,

        tabs: [
          {
            route: { name: 'bidding', params: {} },
            icon: 'fa-file',
            text: this.$t('models.bidding.one'),
            active: false,
          },

          {
            route: { name: 'lots', params: {} },
            icon: 'fa-list',
            text: this.$t('biddings.lots.index.tabs.lots'),
            active: true,
          },


          {
            route: { name: 'invites', params: {} },
            icon: 'fa-envelope',
            text: this.$t('biddings.lots.index.tabs.invites'),
            active: false,
          },
        ]
      }
    },

    computed: {
      showProposalsButton() {
        return this.notGlobalKind && (this.allowedProposalButtonByBiddingStatus || this.closedInviteAndOngoing)
      },

      allowedProposalButtonByBiddingStatus() {
        return _.includes(this.allowedBiddingStatus, this.bidding_status)
      },

      allowedBiddingStatus() {
        return ['under_review', 'draw', 'finnished', 'failure', 'reopened']
      },

      closedInviteAndOngoing() {
        return this.closedInvite && this.bidding_status == 'ongoing'
      },

      closedInvite() {
        return this.bidding_modality == 'closed_invite'
      },

      notGlobalKind() {
        return this.bidding_kind != 'global'
      }

    },

    methods: {

      attachmentPath(attachment) {
        if(typeof attachment === 'undefined') return
        return app.secrets.api.host + attachment.url
      },

      getLot() {
        return this.$http.get('/cooperative/biddings/' + this.biddingId + '/lots/' + this.$route.params.id)
          .then((response) => {
            this.lot = response.data
            this.lot_group_items = response.data.lot_group_items || []

            this.bidding_kind = this.lot.bidding_kind
            this.bidding_status = (this.lot.bidding_status) || 'draft'
            this.bidding_modality = this.lot.bidding_modality

            this.updateTabsRoutes()
            this.$emit('navbarTitleChanged', this.lot.bidding_title)

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      destroy(id) {
        return this.$http.delete('/cooperative/biddings/' + this.biddingId + '/lots/' + id)
          .then((_response) => {
            this.$notifications.info(this.$t('.notifications.destroy.success', { id }))
            this.$router.replace({ name: 'lots', params: { bidding_id: this.biddingId }})
          })
          .catch((_err) => {
            this.$notifications.error(this.$t('.notifications.destroy.failure', { id }))
          })
      },

      destroyDialog(id) {
        let message = {
          title: this.$t('.destroy.title'),
          body: this.$t('.destroy.body')
        }

        let options = {
          cancelText: this.$t('dialog.back'),
          okText: this.$t('dialog.destroy'),
          customClass: 'dg-delete'
        }

        this.$dialog.confirm(message, options)
          .then((dialog) => {
            this.destroy(id)
          })
          .catch(function (err) {
            console.log(err)
            console.log('nop!')
          });
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)

        this.params = params
      },

      toggleOverlay(item) {
        this.overlayItem = item
        this.showOverlay = true
      },

      updateTabsRoutes() {
        this.tabs[0].route.params = { id: this.biddingId }
        this.tabs[1].route.params = { bidding_id: this.biddingId }
        this.tabs[2].route.params = { bidding_id: this.biddingId }
      },

    },

    created: function () {
      this.parseRoute()
      this.getLot()
      this.$emit('tabChanged', this.tabs)
    }
  }

</script>
