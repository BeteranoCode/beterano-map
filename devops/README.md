
# BETERANO MAP — Guía para Developers (flujo local → staging → producción)

Este documento estandariza **cómo trabajamos y publicamos** cambios en el proyecto `beterano-map`,
y cómo se integran con el metarepo `beterano-web` y el header `beterano-web-header`.

---

## 1) Roles de los repos

- **beterano-map**  
  Código de la app del mapa.  
  - `dev` → rama de trabajo/experimentos (local).
  - `main` → rama estable.
  - `gh-pages` → **staging** (URL pública de pruebas).

- **beterano-web**  
  Metarepo que incluye `beterano-map` (y otros) como **submódulos**.  
  - `gh-pages` de `beterano-web` = **producción** (lo que ve el usuario final).

- **beterano-web-header**  
  Repo del header. Publica a su propio `gh-pages` (actúa como CDN).  
  Al consumirlo, **rompe caché** subiendo la versión en la query:
  `...?v=1.1.2`.

---

## 2) Scripts disponibles

Los scripts viven en `devops/`:

- `devops/dev-preview.sh`  
  Compila y lanza **preview local de producción** (Vite preview).  
  Muestra una **chuleta** con los siguientes pasos (commit/merge/deploy).

- `devops/publish-staging.sh`  
  (Interactivo) Permite **commitear en `dev`**, hace **merge a `main`** y llama a `deploy.sh` para publicar **staging**.

El deploy real lo hace **`deploy.sh`** (en la raíz del repo).  
Además, si se ejecuta desde el submódulo dentro de `beterano-web`, **actualiza el puntero del submódulo** en el superproyecto y hace push.

> Si decides mover `deploy.sh` dentro de `devops/`, llama a `bash devops/deploy.sh`.

---

## 3) Entornos y ramas

- **Local (dev):** pruebas en tu máquina con `vite preview`, simulando producción.
- **Staging:** `gh-pages` de `beterano-map` (URL pública de pruebas).
- **Producción:** `gh-pages` de `beterano-web` (web para consumidores).

**Regla:** No hacer commits manuales en `main` (salvo hotfix); promover cambios `dev → main`.

---

## 4) Flujos por escenario

### A) Desarrollo diario (local, rama `dev`)
**Repo:** `beterano-map`  
**Objetivo:** ver cambios local “como producción” y decidir si promover.

1. Ejecuta:
   ```bash
   ./devops/dev-preview.sh
   ```
   - Compila (`npm run build`) y lanza `vite preview`.
   - Abre `http://localhost:4173/beterano-map/` (puerto configurable con `PORT`).
   - En pantalla verás la guía para los siguientes pasos.

2. **Si está correcto**, haz **commit en `dev`** con el mensaje que te proporcione ChatGPT (o el tuyo):
   ```bash
   git add -A
   git commit -m "fix(css): mapa visible en desktop; root sin absolute y wrapper 100%"
   git push origin dev
   ```

3. Promueve a **estable**:
   ```bash
   git checkout main
   git pull
   git merge --no-ff dev -m "merge: dev → main (lote de fixes)"
   git push origin main
   ```

4. (Opcional) Publica a **staging**:
   ```bash
   bash deploy.sh --branch main
   ```

> Alternativa todo-en-uno:  
> Usa `./devops/publish-staging.sh` después del preview; te pedirá el mensaje de commit y hará commit → merge → deploy.

---

### B) Subir a STAGING (gh-pages de `beterano-map`)
**Repo:** `beterano-map`  
**Objetivo:** ver una **URL pública de pruebas**.

- Rápido (interactivo):
  ```bash
  ./devops/publish-staging.sh
  ```
- Manual/avanzado:
  ```bash
  git checkout main
  git pull
  # (si no lo hiciste) merge dev → main
  bash deploy.sh --branch main
  ```

---

### C) Trabajar desde `beterano-web` (submódulos)
**Estás en:** `beterano-web/submodules/beterano-map/`  
**Objetivo:** publicar staging **y** que el superproyecto apunte al nuevo commit.

- Ejecuta dentro del submódulo:
  ```bash
  ./devops/publish-staging.sh
  # o:
  bash deploy.sh --branch main
  ```
  `deploy.sh` detectará el superproyecto y hará **commit + push** del *bump* del submódulo en `beterano-web`.

> Producción se publica desde `beterano-web` (ver siguiente punto).

---

### D) Publicar en PRODUCCIÓN (gh-pages de `beterano-web`)
**Repo:** `beterano-web`  
**Objetivo:** desplegar **la web que ve el usuario**.

1. Asegura que el submódulo `beterano-map` apunta al commit estable:
   ```bash
   git pull
   git submodule update --init --recursive
   # si el bump no lo hizo deploy.sh:
   git submodule update --remote --merge submodules/beterano-map
   git add submodules/beterano-map
   git commit -m "chore(submodule): bump beterano-map to latest main"
   git push
   ```

2. Lanza tu **deploy de beterano-web** (p. ej. `bash deploy_web.sh`) para publicar a su `gh-pages`.

---

## 5) Cambios en `beterano-web-header`

Estos scripts **no aplican** a ese repo.  
Flujo recomendado:
1. Trabaja en `beterano-web-header` → publica su `gh-pages`.
2. En los proyectos que lo consumen, **rompe caché** subiendo `?v=` en los `<script src=…>`.
3. (Si `beterano-map` usa el header) actualiza la versión en el loader del `index.html`.

---

## 6) Config útil

- **Preview local:** usa `PORT` (por defecto `4173`) y base `"/beterano-map/"`.  
  Puedes sobrescribir el puerto: `PORT=5180 ./devops/dev-preview.sh`.

- **EOL (Windows):**  
  Para evitar problemas con finales de línea en `.sh`:
  ```
  *.sh text eol=lf
  ```
  Guárdalo en `.gitattributes` en la raíz del repo.

---

## 7) Comandos rápidos (chuleta)

**Preview local (prod-like):**
```bash
./devops/dev-preview.sh
```

**Commit en dev (ejemplo):**
```bash
git add -A
git commit -m "fix: corrección estilos sidebar en desktop"
git push origin dev
```

**Promover a estable:**
```bash
git checkout main
git pull
git merge --no-ff dev -m "merge: dev → main (lote de fixes)"
git push origin main
```

**Publicar STAGING:**
```bash
bash deploy.sh --branch main
# o todo-en-uno:
./devops/publish-staging.sh
```

**Publicar PRODUCCIÓN (desde beterano-web):**
```bash
git pull
git submodule update --init --recursive
git submodule update --remote --merge submodules/beterano-map
git add submodules/beterano-map
git commit -m "chore(submodule): bump beterano-map to latest main"
git push
bash deploy_web.sh
```

---

## 8) Mensajes de commit sugeridos

- Fix puntual:
  ```
  fix(css): mapa visible en desktop; root sin absolute y wrapper 100%
  ```

- Merge de lote:
  ```
  merge: dev → main (lote de fixes)
  ```

- Bump de submódulo (en beterano-web):
  ```
  chore(submodule): bump beterano-map to <SHA> (main)
  ```

---

## 9) FAQ

- **No veo el mapa en desktop:**  
  Asegura que `#root` usa `margin-top + height: calc(...)`, y el wrapper del mapa
  (`.map-leaflet-wrapper`) ocupa `100%` con `position:absolute; inset:0`.

- **Staging publicado pero producción no cambia:**  
  Producción vive en `beterano-web/gh-pages`. Actualiza el submódulo y despliega `beterano-web`.

- **Header no se actualiza:**  
  Sube el `?v=` del loader para romper caché del CDN (`beterano-web-header`).


## 10) Diagrama de flujo

```mermaid
flowchart TD
  A([Inicio]) --> B{¿Qué repo vas a tocar?}

  %% ───── beterano-map (desarrollo local) ─────
  B -->|beterano-map| C{¿Estás en rama dev?}
  C -->|No| C1[git checkout dev] --> D[./devops/dev-preview.sh<br/>build + preview local]
  C -->|Sí| D
  D --> E{¿Se ve OK en preview?}
  E -->|No| D
  E -->|Sí| G{¿Publicar STAGING?}
  G -->|Sí automático| H[./devops/publish-staging.sh<br/>commit dev → merge main → deploy.sh]
  G -->|Sí manual| H2[Commit en dev + push<br/>merge dev→main + push<br/>bash deploy.sh --branch main]
  G -->|No| Z[Fin / o dejar en dev / o solo merge a main]

  H --> I{¿Publicar PRODUCCIÓN?}
  H2 --> I
  I -->|Sí| J[Ir a repo: beterano-web]
  J --> K[Actualizar submódulo beterano-map a main<br/>git pull<br/>git submodule update --init --recursive<br/>git submodule update --remote --merge submodules/beterano-map<br/>git add submodules/beterano-map<br/>git commit -m "chore(submodule): bump beterano-map"<br/>git push]
  K --> L[deploy_web.sh<br/>publica gh-pages de beterano-web]
  I -->|No| Z

  %% ───── beterano-web (submódulo abierto) ─────
  B -->|beterano-web (submódulo)| M[Estás en beterano-web/submodules/beterano-map]
  M --> N{¿Quieres STAGING?}
  N -->|Sí| O[bash deploy.sh --branch main<br/>hace bump del submódulo en beterano-web]
  O --> I
  N -->|No| Z

  %% ───── beterano-web-header (CDN) ─────
  B -->|beterano-web-header| P[Publica su gh-pages]
  P --> Q[Rompe caché en consumidores<br/>sube ?v= en loader]
  Q --> R{¿Consumidor = beterano-map?}
  R -->|Sí| S[Actualiza loader en index.html<br/>y repite STAGING/PROD]
  R -->|No| Z
```
