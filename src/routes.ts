import type Route from './interfaces/Route.ts';
import { createElement, type ComponentType } from 'react';
import HomePage from './pages/HomePage.tsx';
import PlannerPage from './pages/PlannerPage.tsx';
import ShoppingListPage from './pages/ShoppingListPage.tsx';
import RecipeDetailPage from './pages/RecipeDetailPage.tsx';
import FavoritesPage from './pages/FavoritesPage.tsx';

type RoutedComponent = ComponentType & { route?: Omit<Route, 'element'> };

const pages: RoutedComponent[] = [
  HomePage as RoutedComponent,
  PlannerPage as RoutedComponent,
  ShoppingListPage as RoutedComponent,
  RecipeDetailPage as RoutedComponent,
  FavoritesPage as RoutedComponent,
];

function toRoute(Comp: RoutedComponent): Route {
  const meta = (Comp as any).route;
  if (!meta?.path) {
    throw new Error(
      `${
        Comp.displayName || Comp.name || 'Anonymous'
      } missing static route meta`
    );
  }
  return { element: createElement(Comp), ...meta };
}

export default pages
  .sort((a, b) => (a.route?.index ?? 0) - (b.route?.index ?? 0))
  .map(toRoute);
