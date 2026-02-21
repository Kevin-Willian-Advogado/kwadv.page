import { Routes } from '@angular/router';

import { Layout } from "@layout/layout";
import { LandingPage } from "@pages/landing-page/landing-page";
import { Articles } from "@pages/articles/articles";
import { Article } from "@pages/article/article";

export const routes: Routes = [
    {
        path: '', 
        component: Layout,
        children: [
            { path: '', component: LandingPage },
            { path: 'artigos', component: Articles },
            { path: 'artigo/:slug', component: Article }
        ]
    }
];