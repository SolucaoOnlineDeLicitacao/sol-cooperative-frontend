import NotFound from '@/components/not-found.vue'

import Login from '@/views/login.vue'
import Terms from '@/views/terms.vue'

import editProfile from '@/views/profile/edit.vue'
import editPassword from '@/views/password/edit.vue'

import Home from '@/views/home.vue'
import Map from '@/views/map.vue'

import Notifications from '@/views/notifications/index.vue'

import Contracts from '@/views/contracts/index.vue'
import Contract from '@/views/contracts/show.vue'
import EditPartialExecutionContract from '@/views/contracts/partial_execution/edit.vue'

import Covenants from '@/views/covenants/index.vue'
import Covenant from '@/views/covenants/show.vue'

import Groups from '@/views/covenants/groups/index.vue'
import Group from '@/views/covenants/groups/show.vue'

import Biddings from '@/views/biddings/index.vue'
import NewBidding from '@/views/biddings/new.vue'
import Bidding from '@/views/biddings/show.vue'
import EditBidding from '@/views/biddings/edit.vue'

import Invites from '@/views/biddings/invites/index.vue'
import EditBiddingInvites from '@/views/biddings/invites/edit.vue'

import Lots from '@/views/biddings/lots/index.vue'
import NewLot from '@/views/biddings/lots/new.vue'
import Lot from '@/views/biddings/lots/show.vue'
import EditLot from '@/views/biddings/lots/edit.vue'

import Proposals from '@/views/biddings/lots/proposals/index.vue'
import Proposal from '@/views/biddings/lots/proposals/show.vue'

import GlobalProposals from '@/views/biddings/proposals/index.vue'
import GlobalProposal from '@/views/biddings/proposals/show.vue'


const namespace = null

const routes = [
  {
    name:      'home',
    path:      '', // root
    component: Home,
    meta:      {
      auth:       true,
      transition: { name: 'slide-right' }
    }
  },


  {
    name:      'map',
    path:      '/map',
    component: Map,
    meta:      {
      auth:       true,
      transition: { name: 'slide-right' }
    }
  },
  // login
  // ----
  {
    name:      'login',
    path:      '/login',
    component: Login,
    meta:      {
      transition: { name: 'fade' }
    }
  },

  // terms
  // ----
  {
    name:      'terms',
    path:      '/terms',
    component: Terms,
    meta:      {
      transition: { name: 'fade' }
    }
  },

  // password
  // ----
  {
    name:      'editPassword',
    path:      '/password/edit',
    component: editPassword,
    meta:      {
      transition: { name: 'fade' }
    }
  },

  // profile
  // ----
  {
    name:      'editProfile',
    path:      '/profile',
    component: editProfile,
    meta:      {
      auth:       true,
      transition: { name: 'fade' }
    }
  },

  // notifications
  // ----
  {
    name:      'notifications',
    path:      '/notifications',
    component: Notifications,
    meta:      {
      auth:       true,
      transition: { name: 'slide-left' }
    }
  },

  // contracts
  // ----
  {
    name:      'contracts',
    path:      '/contracts',
    component: Contracts,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-right' }
    }
  },

  {
    name:      'contract',
    path:      '/contracts/:id',
    component: Contract,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },


  {
    name:      'editPartialExecutionContract',
    path:      '/contracts/:id/partial_execution',
    component: EditPartialExecutionContract,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },


  // covenants
  // ----
  {
    name:      'covenants',
    path:      '/covenants',
    component: Covenants,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-right' }
    }
  },
  {
    name:      'covenant',
    path:      '/covenants/:id',
    component: Covenant,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

 // groups
  {
    name:      'groups',
    path:      '/covenants/:covenant_id/groups',
    component: Groups,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'group',
    path:      '/covenants/:covenant_id/groups/:id',
    component: Group,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },


  // biddings
  // ----
  {
    name:      'biddings',
    path:      '/biddings',
    component: Biddings,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-right' }
    }
  },

  {
    name:      'newBidding',
    path:      '/biddings/new',
    component: NewBidding,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'bidding',
    path:      '/biddings/:id',
    component: Bidding,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'editBidding',
    path:      '/biddings/:id/edit',
    component: EditBidding,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

// invites
  {
    name:      'invites',
    path:      '/biddings/:bidding_id/invites',
    component: Invites,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },
{
    name:      'editBiddingInvites',
    path:      '/biddings/:bidding_id/invites/edit',
    component: EditBiddingInvites,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },


// lots
  {
    name:      'lots',
    path:      '/biddings/:bidding_id/lots',
    component: Lots,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'newLot',
    path:      '/biddings/:bidding_id/lots/new',
    component: NewLot,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'lot',
    path:      '/biddings/:bidding_id/lots/:id',
    component: Lot,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'editLot',
    path:      '/biddings/:bidding_id/lots/:id/edit',
    component: EditLot,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

// proposals
  {
    name:      'proposals',
    path:      '/biddings/:bidding_id/lots/:lot_id/proposals',
    component: Proposals,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  {
    name:      'proposal',
    path:      '/biddings/:bidding_id/lots/:lot_id/proposals/:id',
    component: Proposal,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },
// globalProposals
  {
    name:      'globalProposals',
    path:      '/biddings/:bidding_id/proposals',
    component: GlobalProposals,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },
  {
    name:      'globalProposal',
    path:      '/biddings/:bidding_id/proposals/:id',
    component: GlobalProposal,
    meta:      {
      auth:       true,
      back:       true,
      transition: { name: 'slide-left' }
    }
  },

  // TODO componetnes específicos para rotas específicas!
  // Rails tem ErrorsController, com páginas dinâmicas em rotas específicas:
  // /401 - unauthorized (não autenticado)
  // /403 - forbidden (não tem permissão)
  // /404 - not found
  // /422 - falha de verificação CSRF e CORS
  // /500 - internal server error
  //

  // "catch-all" componente para rotas não encontradas (404):
  { path: '*', component: NotFound }
]


export { routes, namespace }
export default routes
