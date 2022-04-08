import { lazy } from 'react';

const routes = [

  {
    path: 'home',
    component: lazy(() => import('../pages/HomePage')),
    exact: true
  },

  {
    path: 'history',
    component: lazy(() => import('../pages/HistoryPage')),
    exact: true
  },

  {
    path: 'workout',
    component: lazy(() => import('../pages/WorkoutPage')),
    exact: true
  },

  {
    path: 'exercises',
    component: lazy(() => import('../pages/ExercisePage')),
    exact: true
  },

  {
    path: 'profile',
    component: lazy(() => import('../pages/ProfilePage')),
    exact: true
  },
];

export default routes;