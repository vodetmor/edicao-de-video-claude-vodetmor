// Catálogo de blocos: o nome usado na spec -> o componente. Para criar um bloco novo, registre aqui.
import type React from 'react';
import type {BlocoProps} from '../tipos';
import {Batida} from './Batida';
import {Botao} from './Botao';
import {HtmlGsap} from './HtmlGsap';
import {Legenda} from './Legenda';
import {Slam} from './Slam';
import {Trilha} from './Trilha';

export const BLOCOS: Record<string, React.FC<BlocoProps<any>>> = {Batida, Slam, Botao, Trilha, Legenda, HtmlGsap};
