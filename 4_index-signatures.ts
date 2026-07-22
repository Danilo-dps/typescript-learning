/**
 * EXEMPLO — Index Signatures: tipando objetos dinâmicos
 *
 * Problema que isso resolve: às vezes você não sabe, em tempo de
 * compilação, quais serão as CHAVES de um objeto (vêm de uma API,
 * de input do usuário, de um arquivo de config) — só sabe o tipo
 * dos VALORES. Index signature deixa você tipar essa forma.
 *
 * Roda com: npx tsx exemplo-index-signatures.ts
 * Checagem de tipos isolada: npx tsc --noEmit exemplo-index-signatures.ts
 */

// ─────────────────────────────────────────────────────────────
// 1. SINTAXE BÁSICA — index signature de string
// ─────────────────────────────────────────────────────────────

interface Estoque {
  [produto: string]: number;
  // "produto" é só um nome descritivo pro leitor — pode chamar como quiser.
  // O que importa é: QUALQUER chave string aqui dentro deve valer number.
}

const estoque: Estoque = {
  teclado: 12,
  mouse: 30,
};

estoque["monitor"] = 5; // adiciona uma chave nova sem precisar redeclarar o tipo
console.log(estoque["teclado"]); // 12
console.log(Object.keys(estoque)); // ["teclado", "mouse", "monitor"]

// ─────────────────────────────────────────────────────────────
// 2. O PERIGO: acessar uma chave que não existe
// ─────────────────────────────────────────────────────────────

const valorInexistente = estoque["produtoQueNaoExiste"];
console.log(valorInexistente); // undefined em runtime...

// ...mas o TIPO inferido por padrão é "number", não "number | undefined".
// Ou seja: por padrão, TypeScript CONFIA que toda chave existe — o que é
// falso. Isso é uma armadilha clássica de index signature sem cuidado extra.

// const dobro = valorInexistente * 2; // roda sem erro de compilação (!),
// mas quebra em runtime: NaN, porque undefined * 2 não é um número válido.

// ─────────────────────────────────────────────────────────────
// 3. A CORREÇÃO: "noUncheckedIndexedAccess" no tsconfig.json
// (essa é uma das opções "avançadas" que apareceram no seu tsconfig)
// ─────────────────────────────────────────────────────────────
//
// Com essa opção LIGADA, o tipo de "estoque[chave]" passa a ser
// "number | undefined" automaticamente — e o código abaixo NÃO compila
// mais sem tratar o undefined primeiro:
//
//   const valor = estoque["x"];
//   const dobro = valor * 2;
//   // error TS18048: 'valor' is possibly 'undefined'.
//
// Testei os dois cenários (com e sem a opção) antes de escrever este
// arquivo — sem ela, o erro acima passa batido; com ela, o compilador
// força você a tratar o caso de a chave não existir:

function acessarComSeguranca(dados: Estoque, chave: string): number {
  const valor = dados[chave];
  if (valor === undefined) {
    return 0; // ou lançar erro, ou outro valor padrão — decisão sua
  }
  return valor * 2; // aqui o TS já sabe que não é mais undefined
}

console.log(acessarComSeguranca(estoque, "teclado"));           // 24
console.log(acessarComSeguranca(estoque, "produtoQueNaoExiste")); // 0

// ─────────────────────────────────────────────────────────────
// 4. MISTURANDO PROPRIEDADES FIXAS COM INDEX SIGNATURE
// ─────────────────────────────────────────────────────────────
// Dá pra ter campos que você SABE que existem, junto com campos dinâmicos —
// mas toda propriedade fixa precisa ser COMPATÍVEL com o tipo do index
// signature (testei: se não for compatível, o compilador barra).

interface ConfiguracaoApp {
  nomeApp: string;         // propriedade fixa, sempre existe, sempre string
  [chave: string]: string; // qualquer outra chave também deve ser string
}

const config: ConfiguracaoApp = {
  nomeApp: "Meu App",
  tema: "escuro",
  idioma: "pt-BR",
};

console.log(config.nomeApp); // acesso normal, com autocomplete
console.log(config["tema"]); // acesso dinâmico

// O exemplo abaixo, se descomentado, NÃO compila — "idade" é number,
// mas o index signature exige que toda chave seja string:
//
// interface Invalido {
//   idade: number;
//   [chave: string]: string;
// }
// error TS2411: Property 'idade' of type 'number' is not assignable
// to 'string' index type 'string'.

// ─────────────────────────────────────────────────────────────
// 5. INDEX SIGNATURE NUMÉRICA — a base de como arrays são tipados
// ─────────────────────────────────────────────────────────────

interface ListaDePares {
  [indice: number]: string;
}

const lista: ListaDePares = { 0: "primeiro", 1: "segundo" };
console.log(lista[0]); // "primeiro"

// Curiosidade: um array normal do TS (string[]) é, por baixo dos panos,
// tratado de forma muito parecida com isso — é por isso que
// "noUncheckedIndexedAccess" também afeta acesso por índice em arrays:
const nomes: string[] = ["Ana", "Bruno"];
const talvezNome = nomes[10]; // índice que não existe
console.log(talvezNome); // undefined em runtime, mesmo "perigo" de antes

// ─────────────────────────────────────────────────────────────
// 6. ALTERNATIVA MAIS LEGÍVEL: Record<K, V> (utility type)
// ─────────────────────────────────────────────────────────────
// Pra casos simples (só chave → valor, sem propriedade fixa misturada),
// "Record" é a forma mais comum e legível de escrever a mesma coisa
// que uma index signature:

type EstoqueRecord = Record<string, number>;

const estoque2: EstoqueRecord = { teclado: 12, mouse: 30 };
console.log(estoque2["mouse"]); // 30

// Record<string, number> e { [chave: string]: number } são
// estruturalmente equivalentes — escolha por legibilidade.
// Record também aceita union de literais como chave, o que index
// signature sozinho não faz diretamente:

type Tema = "claro" | "escuro" | "auto";
const rotulos: Record<Tema, string> = {
  claro: "Modo Claro",
  escuro: "Modo Escuro",
  auto: "Automático",
};
console.log(rotulos.escuro); // "Modo Escuro" — e o TS exige as 3 chaves, nem uma a mais nem a menos

// ─────────────────────────────────────────────────────────────
// 7. READONLY INDEX SIGNATURE — impede reatribuição
// ─────────────────────────────────────────────────────────────

interface TabelaSomenteLeitura {
  readonly [chave: string]: number;
}

const tabela: TabelaSomenteLeitura = { a: 1, b: 2 };
console.log(tabela["a"]); // leitura normal
// tabela["a"] = 99; // se descomentado, NÃO compila:
// error TS2542: Index signature in type 'TabelaSomenteLeitura'
// only permits reading.

// ─────────────────────────────────────────────────────────────
// 8. COMPARANDO COM JAVA
// ─────────────────────────────────────────────────────────────
//
// Em Java, o equivalente mais próximo de "chave dinâmica → valor
// tipado" é uma coleção genérica:
//
//   Map<String, Integer> estoque = new HashMap<>();
//   estoque.put("teclado", 12);
//   estoque.get("chaveQueNaoExiste"); // retorna null, tipo Integer
//
// A diferença conceitual: em Java, o objeto SEMPRE é uma instância de
// Map — é uma coleção separada do "objeto normal" com campos fixos.
// Em TypeScript, index signature é uma FORMA que qualquer objeto pode
// ter, inclusive misturada com campos fixos comuns (ponto 4) — não é
// uma classe/coleção à parte, é só mais uma característica do tipo,
// coerente com a tipagem estrutural que vimos desde o início.
// Além disso, Map.get() do Java já retorna um tipo que aceita null
// (ou Integer, que aceita null por ser wrapper) — o TypeScript só
// alcança essa mesma segurança se você ligar "noUncheckedIndexedAccess".

console.log("--- Fim do exemplo ---");