/**
 * EXEMPLO — Tipos primitivos do TypeScript vs Tipos Objeto (wrapper) do JavaScript
 *
 * TypeScript distingue, na anotação de tipo, MAIÚSCULA de minúscula:
 *   - string, number, boolean   → tipos PRIMITIVOS (valores simples, imutáveis)
 *   - String, Number, Boolean   → tipos OBJETO/WRAPPER (instâncias de classe,
 *                                 herdados diretamente do JavaScript)
 *
 * Isso NÃO é frescura de nomenclatura: são coisas realmente diferentes em
 * runtime, herdadas do próprio JavaScript. TypeScript só formaliza a
 * distinção que o JS sempre teve, mas que sem tipos passava despercebida.
 *
 * Para rodar: npx tsc --strict exemplo-primitivos-vs-wrappers.ts && node exemplo-primitivos-vs-wrappers.js
 */

// ─────────────────────────────────────────────────────────────
// 1. COMO CADA UM É CRIADO
// ─────────────────────────────────────────────────────────────

let nomePrimitivo: string = "Danilo";          // literal → cria um primitivo
let nomeObjeto: String = new String("Danilo"); // "new" → cria um OBJETO wrapper

let idadePrimitiva: number = 25;
let idadeObjeto: Number = new Number(25);

let ativoPrimitivo: boolean = true;
let ativoObjeto: Boolean = new Boolean(true);

// ─────────────────────────────────────────────────────────────
// 2. A DIFERENÇA É REAL EM RUNTIME, NÃO SÓ NO TIPO
// (isso é puro comportamento do JavaScript por baixo do TS)
// ─────────────────────────────────────────────────────────────

console.log(typeof nomePrimitivo); // "string"
console.log(typeof nomeObjeto);    // "object"  <- literalmente um objeto, não uma string

console.log(typeof idadePrimitiva); // "number"
console.log(typeof idadeObjeto);    // "object"

// Comparação de igualdade se comporta diferente:
console.log(nomePrimitivo === "Danilo");        // true  — primitivo compara por valor
console.log(nomeObjeto === "Danilo");            // false — objeto compara por referência, não por valor
console.log(nomeObjeto == "Danilo");             // true  — "==" força coerção do objeto para string

// Dois objetos "iguais" nunca são o mesmo objeto:
console.log(new String("x") === new String("x")); // false — referências diferentes

// O MESMO padrão se repete com number e boolean — não é só coisa de string:

console.log(idadePrimitiva === 25); // true  — primitivo compara por valor
console.log(idadeObjeto === 25);     // false — objeto compara por referência
console.log(idadeObjeto == 25);      // true  — "==" força coerção do objeto para number

console.log(ativoPrimitivo === true); // true  — primitivo compara por valor
console.log(ativoObjeto === true);     // false — objeto compara por referência
console.log(ativoObjeto == true);      // true  — "==" força coerção do objeto para boolean

// Curiosidade que costuma pegar gente desprevenida: um Boolean(false) OBJETO
// é "truthy" dentro de um if — porque todo objeto é truthy, mesmo envolvendo
// um valor falso por dentro:
const armadilha: Boolean = new Boolean(false);
if (armadilha) {
  console.log("Entrou no if mesmo o valor interno sendo 'false' — é um objeto, e objeto é sempre truthy");
}

// ─────────────────────────────────────────────────────────────
// 3. ATRIBUIÇÃO: PRIMITIVO → WRAPPER funciona, o INVERSO NÃO
// (testado com tsc --strict antes de escrever este arquivo)
// ─────────────────────────────────────────────────────────────

let permitido: String = "primitivo indo para tipo wrapper"; // ✅ compila
console.log(permitido); // roda normal — em runtime é só uma string comum,
                         // a diferença de tipo só existe em tempo de compilação
// TypeScript aceita porque todo primitivo "cabe" estruturalmente no wrapper

// A linha abaixo, se descomentada, NÃO compila:
// let bloqueado: string = new String("wrapper indo para tipo primitivo");
//
// Erro real do compilador:
// error TS2322: Type 'String' is not assignable to type 'string'.
//   'string' is a primitive, but 'String' is a wrapper object.
//   Prefer using 'string' when possible.
//
// Ou seja: o PRÓPRIO TypeScript recomenda, na mensagem de erro,
// usar o tipo minúsculo.

// ─────────────────────────────────────────────────────────────
// 4. POR QUE ISSO IMPORTA NA PRÁTICA — bug clássico de comparação
// ─────────────────────────────────────────────────────────────

function validarSenha(senhaDigitada: string, senhaCorreta: string): boolean {
  return senhaDigitada === senhaCorreta;
}

const senhaVindaDeAlgumLugar = new String("1234"); // se isso viesse assim por engano...
// validarSenha(senhaVindaDeAlgumLugar, "1234");
// ↑ o próprio TypeScript BARRA essa chamada em tempo de compilação,
// porque o parâmetro é "string" (primitivo) e o argumento é "String" (objeto).
// Sem TypeScript, em JavaScript puro, isso compilaria e rodaria — e o "===" 
// dentro da função retornaria FALSE mesmo com o valor "certo", porque um
// objeto nunca é === a um primitivo. Esse é o tipo de bug silencioso que
// TypeScript existe para prevenir

// ─────────────────────────────────────────────────────────────
// 5. MÉTODOS FUNCIONAM NOS DOIS, MAS POR UM MOTIVO DIFERENTE
// (o JS "empresta" os métodos de String.prototype para o primitivo)
// ─────────────────────────────────────────────────────────────

console.log(nomePrimitivo.toUpperCase()); // "DANILO"
console.log(nomeObjeto.toUpperCase());    // "DANILO" — mesmo resultado, mecanismo diferente

// Por baixo dos panos, ao chamar .toUpperCase() num primitivo, o JS cria
// um wrapper TEMPORÁRIO automaticamente ("auto-boxing"), executa o método,
// e descarta o wrapper. Isso é transparente e não exige "new" manual —
// é justamente esse auto-boxing que torna o "new String(...)" explícito
// desnecessário na prática.

// ─────────────────────────────────────────────────────────────
// 6. REGRA PRÁTICA (a própria documentação do TypeScript recomenda)
// ─────────────────────────────────────────────────────────────
//
//   Use SEMPRE minúsculo:  string | number | boolean | symbol | bigint
//   NUNCA use os wrappers: String | Number | Boolean | Symbol | BigInt
//   nas suas anotações de tipo — reserve "new String()" etc. apenas para
//   os raríssimos casos em que você precisa mesmo de um objeto (quase nunca).
//
// Isso é diferente do Java, onde String é a única opção para texto
// (não existe "primitivo de texto" em Java) e int/Integer é uma escolha
// consciente entre primitivo e wrapper (ex: para permitir null ou uso
// em coleções genéricas). Em TypeScript, o wrapper praticamente não tem
// uso legítimo — ele existe só porque o JavaScript sempre o teve.

console.log("--- Fim do exemplo ---");