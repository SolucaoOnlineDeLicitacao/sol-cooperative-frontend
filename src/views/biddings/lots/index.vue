<style scoped lang="scss">
  .list-item {
    .list-span {
      margin-right: 10px;
    }
  }

  .badge {
    &.draft {
      background-color: $greyish-brown;
    }

    &.canceled,
    &.failure {
      background-color: $danger-color;
    }

    &.accepted {
      background-color: $apple-green;
    }

    &.desert {
      background-color: $peach;
    }

  }
</style>

<template lang="pug">
  .mt-2
    .container
      .alert.alert-danger.mb-2(v-if="errors['invites']")
        | {{ errors["invites"] }}

      bidding-alerts(:status="bidding_status", :closedInviteAndOngoing="closedInviteAndOngoing")

      template(v-if="showProposalsButton")
        router-link.mb-2.button.button-primary.router-link.u-full-width.mb-0(:to="{ name: 'globalProposals', params: { bidding_id: this.biddingId } }")
          | {{ this.$t('.button.proposals') }}

      .card
        h4 {{ $t('.title') }}

        hr.mt-2.mb-2.o-container

        .text-center(v-if="bidding_status == 'draft'")
          router-link.button.button-primary.router-link.u-full-width.mb-0.button-add-lot(:to="{ name: 'newLot' }")
            | {{ $t('.button.new') }}

          hr.mt-2.mb-2.o-container

        ul.mb-0.blink-50(v-if="isLoading")
          li.list-item.o-container
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x
          li.list-item.loading-2.o-container
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

          li.list-item.loading-3.o-container
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

          li.list-item.loading-4.o-container
            .container
              .list-title
              i.fas.fa-spinner.fa-pulse.fa-2x

        ul.mb-0(v-else-if="lotsCount")
          li.list-item.o-container.row(v-for="(lot) in lots")
            router-link(:to="{ name: 'lot', params: { bidding_id: lot.bidding_id, id: lot.id } }")
              .container
                .list-title
                  | {{ lot.title }}
                span.list-span
                  | {{ $t('.lot_group_items_count', { value: lot.lot_group_items_count }) }}
                span.badge(:class="lot.status" v-if="lot.status != 'draft' && lot.status != 'waiting'")
                  | {{ $t('models.lot.attributes.statuses.' + lot.status) }}

        ul.mb-0(v-else)
          li.list-item.mb-0.empty
            .container
              | {{ $t('.empty') }}

      button.u-full-width.button-submit.mt-3.button-finish-draft.button-long(@click="waitingBidding" v-if="lotsCount && bidding_status == 'draft'")
        | {{ $t('.button.finish') }}

    overlay-notification(v-if="showWaitingOverlay", :showOverlay="showWaitingOverlay", :text="$t('.notifications.waiting.success')")

</template>

<script>
  import BiddingAlerts from './_index/bidding-alerts'

  export default {
    name: 'lots',

    components: {
      BiddingAlerts
    },

    data () {
      return {
        i18nScope: 'biddings.lots.index',

        // resource
        isLoading: true,
        lots: null,
        lotsCount: null,
        params: {},
        errors: {},

        bidding_status: null,
        bidding_kind: null,
        bidding_modality: null,

        showWaitingOverlay: false,

        tabs: [
          {
            route: { name: 'bidding', params: {} },
            icon: 'fa-file',
            text: this.$t('models.bidding.one'),
            active: false,
          },

          {
            route: { name: 'lots', params: { bidding_id: null } },
            icon: 'fa-list',
            text: this.$t('biddings.lots.index.tabs.lots'),
            active: true,
          },

          {
            route: { name: 'invites', params: {} },
            icon: 'fa-envelope',
            text: this.$t('biddings.lots.index.tabs.invites'),
            active: false,
          }
        ]
      }
    },

    computed: {
      showProposalsButton() {
        return this.globalKind && (this.allowedProposalButtonByBiddingStatus || this.closedInviteAndOngoing)
      },

      showProposalsCount() {
        return this.globalKind && this.allowedProposalCountByBiddingStatus
      },

      allowedProposalCountByBiddingStatus() {
        return this.bidding_status == 'ongoing' || this.bidding_status == 'draw'
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

      globalKind() {
        return this.bidding_kind == 'global'
      }
    },

    methods: {
      fetch() {
        let params = this.params

        this.isLoading = true

        return this.$http.get('/cooperative/biddings/' + this.biddingId + '/lots', { params })
          .then((response) => {
            this.lots = response.data
            this.lotsCount = this.lots.length

            this.bidding_status = (this.lots[0] && this.lots[0].bidding_status) || 'draft'
            this.bidding_kind = (this.lots[0] && this.lots[0].bidding_kind)
            this.bidding_modality = (this.lots[0] && this.lots[0].bidding_modality)

            if(this.lotsCount > 0) {
              this.$emit('navbarTitleChanged', this.lots[0].bidding_title.substring(0,25))
            }

            this.isLoading = false

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      waitingBidding() {
        this.$http.patch('/cooperative/biddings/' + this.biddingId + '/waiting')
          .then((response) => {
            this.$notifications.clear()
            this.$notifications.info(this.$t('.notifications.waiting.success'))

            this.showWaitingOverlay = true
            this.bidding_status = 'waiting'
          })
          .catch((err) => {
            let errors = _.dig(err, 'response', 'data', 'errors') || {}

            this.errors = this.$i18n.errify(errors, { model: 'bidding' })

            this.$notifications.error(this.$t('.notifications.waiting.failure'))
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)

        this.params = params
      },

      updateTabsRoutes() {
        this.tabs[0].route.params = { id: this.biddingId }
        this.tabs[1].route.params = { bidding_id: this.biddingId }
      },

      init() {
        this.parseRoute()
        this.updateTabsRoutes()
        this.fetch()
        this.$emit('tabChanged', this.tabs)
      }
    },

    created: function () {
      this.init();
    },

  }

</script>
