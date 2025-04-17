let artigos = {};

fetch('artigos.json')
  .then(response => response.json())
  .then(data => {
    artigos = data.reduce((acc, artigo) => {
      acc[artigo.id] = artigo;
      return acc;
    }, {});
  })
  .catch(error => console.error("Erro ao carregar o arquivo JSON:", error));

  function toggleAgravanteOptions(element) {
    const bloco = element.closest('.form-check');
    const reincidenciaOptions = bloco.querySelector('.reincidencia-options');
    if (reincidenciaOptions) {
      reincidenciaOptions.style.display = element.checked ? 'block' : 'none';
    }
  }
  
  function toggleAtenuanteOptions(checkbox) {
    const bloco = $(checkbox).closest('.tab-pane');
    var atenuanteId = $(checkbox).val();
    var possuiGrau = $(checkbox).data('possui-grau') === true || $(checkbox).data('possui-grau') === 'true';
    var opcoesGrau = $(checkbox).data('grau-opcoes');
    var containerPai = $(checkbox).parent(); // div.form-check
  
    // Remove bloco anterior se existir
    containerPai.find('.atenuante-options').remove();
  
    if (checkbox.checked && possuiGrau && opcoesGrau) {
      // Cria div dinamicamente
      var html = '<div class="atenuante-options mt-2" style="margin-left: 20px;">';
      html += '<label>Selecione o grau:</label>';
      html += '<select class="form-select form-select-sm mt-1">';
  
      var opcoes = opcoesGrau.split(',');
      opcoes.forEach(function(opcao) {
        html += '<option value="' + opcao.trim() + '">' + opcao.trim() + '</option>';
      });
  
      html += '</select></div>';
  
      containerPai.append(html);
    }
  }
  

   
function calcularPena() {
  const blocos = document.querySelectorAll('.tab-pane');
  let resultadoGeral = "";

  blocos.forEach((bloco, index) => {
    const artigoSelecionado = bloco.querySelector(".artigo-select")?.value;

    if (!artigoSelecionado || !artigos[artigoSelecionado]) {
      resultadoGeral += `<div class='alert alert-warning'>Crime ${index + 1}: Selecione um artigo válido.</div>`;
      return;
    }
    const artigo = artigos[artigoSelecionado];
    let penaMinima = artigo.pena_minima;
    let penaMaxima = artigo.pena_maxima;
    let penaFinal = (penaMinima + penaMaxima) / 2;

    // Agravantes
    const agravantesInputs = bloco.querySelectorAll('.agravantes input:checked');
    let agravanteExtra = 0;
    let temReincidencia = false;

    agravantesInputs.forEach(input => {
      const tipo = input.dataset.tipo;

      switch (tipo) {
        case "reincidencia":
          temReincidencia = true;
          break;
        case "concurso_pessoas":
          penaFinal += penaFinal * (1 / 4);
          penaFinal = Math.min(penaFinal, penaMaxima);
          break;
        case "motivo_futil":
          if (artigoSelecionado === "121") {
            penaFinal += penaFinal * (1 / 3);
            penaMaxima = 30;
          }
          break;
        case "abuso_autoridade":
          penaFinal += 2;
          break;
        case "abuso_confianca":
          penaFinal = artigoSelecionado === "155" ? penaFinal * 2 : penaFinal + 1;
          break;
        case "violencia_ameaca":
          penaFinal += penaFinal / 3;
          break;
        case "meios_dificultam":
          penaFinal += penaFinal * (1 / 3);
          break;
        default:
          agravanteExtra += 1;
      }
    });

    if (temReincidencia) {
      const grauSelect = bloco.querySelector(".grau-reincidencia");
      const grau = parseFloat(grauSelect?.value || 0.166);
      if (isNaN(grau)) grau = 0.166;  // Valor padrão se o grau não for numérico
      penaFinal += penaFinal * grau;
    }
  
    penaFinal += agravanteExtra;

    // Atenuantes
    const atenuantesInputs = bloco.querySelectorAll('.atenuante-options input:checked');
    const atenuanteOptions = bloco.querySelector('.atenuante-options');
    atenuantesInputs.forEach(input => {
      const blocoAt = input.closest('.form-check');
      const atenuanteId = input.value;
      const selectAt = blocoAt.querySelector('.grau-atenuante-' + atenuanteId);
      const reducao = parseFloat(selectAt?.value || 0.166);
      penaFinal -= penaFinal * reducao;
    });

    penaFinal = Math.max(penaMinima, Math.min(penaFinal, penaMaxima));

    resultadoGeral += `
     <hr>
      <div class="alert alert-info">
        <strong>Crime ${index + 1} - ${artigo.nome}</strong><br>
        Pena mínima: <strong>${penaMinima} anos</strong><br>
        Pena máxima: <strong>${penaMaxima} anos</strong><br>
        Pena calculada: <strong>${penaFinal.toFixed(1)} anos</strong>
      </div>
    `;
  });

  if (!resultadoGeral) {
    resultadoGeral = `<div class="alert alert-warning">Nenhum crime válido foi adicionado.</div>`;
  }
  document.getElementById("resultadoModalBody").innerHTML = resultadoGeral;
  const modal = new bootstrap.Modal(document.getElementById('resultadoModal'));
  modal.show();
}

let crimeCount = 1;

function adicionarCrime() {
  crimeCount++;
  const newId = `crime-${crimeCount}`;
  const newTabId = `${newId}-tab`;

  const novaAba = document.createElement("li");
  novaAba.className = "nav-item";
  novaAba.role = "presentation";
  novaAba.innerHTML = `
    <button class="nav-link" id="${newTabId}" data-bs-toggle="tab" data-bs-target="#${newId}" type="button" role="tab" aria-controls="${newId}" aria-selected="false">
      Crime ${crimeCount}
      <span class="close-tab" onclick="removerCrime('${newId}')">&times;</span>
    </button>
  `;
  document.getElementById("crimeTabs").appendChild(novaAba);

  const original = document.getElementById("crime-1");
  const clone = original.cloneNode(true);
  clone.id = newId;
  clone.classList.remove("show", "active");
  clone.setAttribute("aria-labelledby", newTabId);

  clone.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });

  clone.querySelectorAll('.reincidencia-options, .atenuante-options').forEach(div => {
    div.style.display = 'none';
  });

  document.getElementById("crimeTabContent").appendChild(clone);

  const newTab = new bootstrap.Tab(novaAba.querySelector('button'));
  newTab.show();
}

function removerCrime(id) {
  const tabToRemove = document.getElementById(id);
  const tabLink = document.getElementById(`${id}-tab`);
  tabLink.remove();
  tabToRemove.remove();
}

function limparFormulario() {
  crimeCount = 1;

  const tabList = document.getElementById('crimeTabs');
  const tabContent = document.getElementById('crimeTabContent');

  while (tabList.children.length > 1) {
    tabList.removeChild(tabList.lastChild);
  }

  while (tabContent.children.length > 1) {
    const lastPane = tabContent.lastElementChild;
    if (lastPane.classList.contains("tab-pane")) {
      tabContent.removeChild(lastPane);
    } else {
      break;
    }
  }

  const crime1 = document.getElementById("crime-1");
  crime1.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });

  crime1.querySelectorAll('.reincidencia-options, .atenuante-options').forEach(div => {
    div.style.display = 'none';
  });

  document.querySelectorAll('#crimeTabs .nav-link').forEach(link => link.classList.remove("active"));
  document.querySelectorAll('#crimeTabContent .tab-pane').forEach(pane => pane.classList.remove("show", "active"));
  document.getElementById("crime-1-tab").classList.add("active");
  document.getElementById("crime-1").classList.add("show", "active");

  document.getElementById("resultadoModalBody").innerHTML = '';
}

// Mostrar/ocultar reincidência e atenuante
document.addEventListener('change', function(e) {
  // Reincidência
  if (e.target.matches('.agravantes input[data-tipo="reincidencia"]')) {
    const bloco = e.target.closest('.tab-pane');
    const reincidenciaOptions = bloco.querySelector('.reincidencia-options');
    if (e.target.checked) {
      reincidenciaOptions.style.display = 'block';
    } else {
      reincidenciaOptions.style.display = 'none';
    }
  }

  // Atenuantes com grau
  if (e.target.matches('.atenuantes input[type="checkbox"]')) {
    const bloco = e.target.closest('.form-check');
    const atenuanteOptions = bloco.querySelector('.atenuante-options');
    if (atenuanteOptions) {
    atenuanteOptions.style.display = e.target.checked ? 'block' : 'none';
  }
}

});
