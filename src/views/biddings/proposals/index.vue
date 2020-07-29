<style scoped lang="scss">
</style>

<template lang="pug">
  .mt-2
    .container
      .alert.alert-info(v-if="proposals && proposals[0]")
        | {{ $t('.estimated_value', { value: $asCurrency(proposals[0].bidding_estimated_cost_total) }) }}

      .card.slim
        .container.mb-2
          h4.mt-2 {{ $t('.list.title') }}

          hr.mt-2.mb-2.o-container

        ul.mt-2.blink-50(v-if="isLoading")
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

        ul.mb-0(v-else-if="proposalsCount")
          template(v-for="(proposal, index) in proposals")
            proposal-item(:proposal="proposal", :bidding="bidding", :index="index", @successAccept="fetch", @successRefuse="fetch", pathName="globalProposal")

        ul(v-else-if="!seeProposals")
          li.list-item.mb-1
            .container.mt-2
              | {{ $t('.cant_see') }}

        ul(v-else)
          li.list-item.mb-1
            .container
              | {{ $t('.empty') }}

</template>

<script>
  import ProposalItem from '../lots/proposals/_index/proposal-item'

  export default {
    name: 'globalProposals',

    components: {
      ProposalItem
    },

    data () {
      return {
        i18nScope: 'biddings.proposals.index',

        // resource
        isLoading: true,
        bidding: null,
        proposals: null,
        proposalsCount: null,

        params: {},

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
      seeProposals() {
        return this.defaultBiddingStatus || this.closedInviteAndOngoing
      },

      defaultBiddingStatus() {
        return _.includes(this.allowedBiddingStatus, this.bidding.status)
      },

      allowedBiddingStatus() {
        return ['under_review', 'draw', 'finnished', 'failure', 'reopened']
      },

      closedInviteAndOngoing() {
        return this.closedInvite && this.bidding.status == 'ongoing'
      },

      closedInvite() {
        return this.bidding.modality == 'closed_invite'
      },

    },

    methods: {
      fetch() {
        let params = this.params

        this.isLoading = true

        return this.$http.get('/cooperative/biddings/' + this.biddingId)
          .then((response) => {
            this.bidding = response.data
            return response
          })
          .then((response) => {
            if(this.seeProposals) {
              this.$http.get('/cooperative/biddings/' + this.biddingId + '/proposals', { params })
                .then((response) => {
                  this.proposals = response.data
                  this.proposalsCount = this.proposals.length

                  this.isLoading = false

                }).catch((_err) => {
                  this.error = _err
                  console.error(_err)
                })
            }else{
              this.isLoading = false
            }

          }).catch((_err) => {
            this.error = _err
            console.error(_err)
          })
      },

      parseRoute() {
        let params = {}

        params.id = this.$params.asInteger(this.$route.params.id)

        this.biddingId = this.$params.asInteger(this.$route.params.bidding_id)
        this.lotId = this.$params.asInteger(this.$route.params.lot_id)
        this.params = params
      },

      updateTabsRoutes() {
        this.tabs[0].route.params = { id: this.biddingId }
        this.tabs[1].route.params = { bidding_id: this.biddingId }
        this.tabs[2].route.params = { bidding_id: this.biddingId, lot_id: this.lotId }
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
