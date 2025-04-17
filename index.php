<?php

$artigos_json = file_get_contents('artigos.json');
$artigos = json_decode($artigos_json, true);

$agravantes_json = file_get_contents('agravantes.json');
$agravantes = json_decode($agravantes_json, true);

$atenuantes_json = file_get_contents('atenuantes.json');
$atenuantes = json_decode($atenuantes_json, true);
?>

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard - Calculadora Penal</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"/>
  <style>
    body {
      background-color: #f8f9fa;
    }
    .sidebar {
      min-height: 100vh;
      background-color: #343a40;
    }
    .sidebar a {
      color: #fff;
      text-decoration: none;
      display: block;
      padding: 1rem;
    }
    .sidebar a:hover {
      background-color: #495057;
    }
    .content {
      padding: 2rem;
    }
    .card {
      margin-bottom: 1.5rem;
    }
    .checkbox-list {
      max-height: 200px;
      overflow-y: auto;
    }
    .close-tab {
      font-size: 18px;
      color: red;
      cursor: pointer;
      margin-left: 10px;
    }
    .close-tab:hover {
      color: darkred;
}

    
  </style>
  <link href="https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/css/select2.min.css" rel="stylesheet" />
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js"></script>
</head>
<body>
  <div class="container-fluid">
    <div class="row">
      <!-- Sidebar -->
      <nav class="col-md-2 sidebar">
        <div class="d-flex flex-column p-3">
          <h2 class="text-white">Uiu Dashboard</h2>
          <a href="#" class="text-white">Dashboard</a>
          <a href="#" class="text-white">Crimes</a>
          <a href="#" class="text-white">Calculadora Penal</a>
          <a href="#" class="text-white">Configurações</a>
          <a href="#" class="text-white">Sair</a>
        </div>
      </nav>

      <main class="col-md-10 content">
        <h1 class="mb-4">Calculadora Penal</h1>

        <!-- Tabs de Crimes -->
        <ul class="nav nav-tabs" id="crimeTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="crime-1-tab" data-bs-toggle="tab" data-bs-target="#crime-1" type="button" role="tab" aria-controls="crime-1" aria-selected="true">Crime 1</button>
          </li>
        </ul>

        <div class="tab-content" id="crimeTabContent">
          <div class="tab-pane fade show active" id="crime-1" role="tabpanel" aria-labelledby="crime-1-tab">
            <div class="crime-bloco">
              <div class="card p-4 mb-4">
                <h5>Selecione o Artigo</h5>
                <select class="form-select artigo-select" id="artigo-select">
                    <option value="">Selecione um crime...</option>
                      <?php foreach ($artigos as $artigo): ?>
                        <option value="<?= $artigo['id']; ?>"><?= $artigo['id']; ?> - <?= $artigo['nome']; ?></option>
                    <?php endforeach; ?>
                </select>
              </div>
              <div class="card p-4 mb-4 pena-base-card" style="display:none;">
                <h5>Pena Base</h5>
                <p class="pena-base-display"></p>
              </div>

              <div class="row">
                <!-- Agravantes -->
                    <div class="col-md-6">
                      <div class="card p-4">
                        <h5>Agravantes</h5>
                        <div class="checkbox-list agravantes">
                          <?php
                            // Verificando se a reincidência está entre os agravantes
                            foreach ($agravantes as $agravante): ?>
                              <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="<?= $agravante['id']; ?>" data-tipo="agravante-<?= $agravante['id']; ?>" onchange="toggleAgravanteOptions(this)">
                                <label class="form-check-label"><?= $agravante['nome']; ?></label>
                                
                                <!-- Verificando se o agravante é reincidência -->
                                <?php if ($agravante['nome'] === "Reincidência"): ?>
                                  <div class="reincidencia-options mt-2" style="display:none; margin-left: 20px;">
                                    <label>Selecione o grau:</label>
                                    <select class="form-select form-select-sm grau-reincidencia mt-1">
                                      <?php
                                      // Adicionando os graus dinamicamente para a reincidência
                                      foreach (explode(',', $agravante['grau_opcoes']) as $opcao): ?>
                                        <option value="<?= trim($opcao); ?>"><?= trim($opcao); ?></option>
                                      <?php endforeach; ?>
                                    </select>
                                  </div>
                                <?php endif; ?>
                              </div>
                            <?php endforeach; ?>
                        </div>
                      </div>
                    </div>

                    <!-- Atenuantes -->
                    <div class="col-md-6">
                        <div class="card p-4">
                          <h5>Atenuantes</h5>
                          <div class="checkbox-list atenuantes">
                            <?php foreach ($atenuantes as $atenuante): ?>
                              <div class="form-check">
                              <input class="form-check-input"
                                  type="checkbox"
                                  value="<?= $atenuante['id']; ?>"
                                  data-nome="<?= $atenuante['nome']; ?>"
                                  data-grau-opcoes="<?= $atenuante['grau_opcoes']; ?>"
                                  data-possui-grau="<?= $atenuante['possui_grau'] ? 'true' : 'false'; ?>"
                                  data-tipo="atenuante-<?= $atenuante['id']; ?>"
                                  onchange="toggleAtenuanteOptions(this)">

                                <label class="form-check-label"><?= $atenuante['nome']; ?></label>
                              </div>
                            <?php endforeach; ?>
                          </div>
                        </div>
                      </div>
                    </div> <!-- /row -->
                  </div> <!-- /crime-bloco -->
                </div> <!-- /tab-pane -->
              </div> <!-- /tab-content -->

        <!-- Botões (fora da tab-content, visíveis sempre) -->
        <div class="mt-4">
          <button class="btn btn-success" onclick="calcularPena()">Calcular Pena</button>
          <button class="btn btn-secondary ms-2" onclick="limparFormulario()">Limpar</button>
          <button class="btn btn-primary ms-2" onclick="adicionarCrime()">Adicionar outro crime</button>

          <div class="mt-3" id="resultado"></div>
        </div>

      </main>
    </div>
  </div>

  <!-- Bootstrap Bundle JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js"></script>

  <!-- Modal Resultado -->
  <div class="modal fade" id="resultadoModal" tabindex="-1" aria-labelledby="resultadoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="resultadoModalLabel">Resultado da Pena</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
        </div>
        <div class="modal-body" id="resultadoModalBody">
          <!-- Conteúdo via JS -->
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>