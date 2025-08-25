# Pipeline Directory Reorganization Plan
*Created: January 21, 2025*

## New Structure

```
.pipeline/
│
├── 📥 01-factory-tools/           # THE FACTORY (Tools that build things)
│   ├── viewforge/                 # Field configuration tool
│   │   ├── configurator.html     # The ViewForge UI
│   │   ├── docs/                 # ViewForge documentation
│   │   └── templates/            # Field templates
│   │
│   ├── generators/               # All generators (consume configs, produce code)
│   │   ├── html-generator.js    # Generates HTML from configs
│   │   ├── navigation-generator.js
│   │   ├── layout-generator.js
│   │   ├── react-generator.js   # (future)
│   │   └── vue-generator.js     # (future)
│   │
│   └── docs/                     # Factory documentation
│       ├── philosophy/           # Navigation philosophy, concepts
│       ├── architecture/         # System design docs
│       └── guides/               # How-to guides
│
├── 📝 02-configurations/          # INPUTS (What we configure)
│   ├── entities/                 # Entity configurations from ViewForge
│   │   ├── account/
│   │   │   ├── list-view.json
│   │   │   ├── detail-view.json
│   │   │   └── form-view.json
│   │   ├── service-location/
│   │   └── work-order/
│   │
│   ├── navigation/               # Navigation configurations
│   │   ├── pest-control-v1.json
│   │   └── context-rules.json
│   │
│   └── layouts/                  # Layout configurations
│       ├── three-column.json
│       └── mobile.json
│
├── 🏭 03-generated/              # OUTPUTS (What the factory produces)
│   ├── concept-line/             # HTML outputs
│   │   ├── views/
│   │   ├── navigation/
│   │   └── complete-apps/
│   │
│   ├── prototype-line/           # React outputs
│   │   └── components/
│   │
│   └── production-line/          # Vue outputs
│       └── components/
│
├── 🧪 04-testing/                # Test scenarios and demos
│   ├── demos/
│   │   ├── context-navigation-demo.html
│   │   └── pest-control-demo.html
│   │
│   └── workflows/                # End-to-end workflow tests
│       ├── morning-dispatch/
│       └── field-service/
│
├── 📊 05-feedback/               # Feedback system
│   ├── system/                  # Feedback collection tools
│   ├── sessions/                # Feedback session data
│   └── reports/                 # Analysis and reports
│
└── 📚 06-archive/               # Old iterations, backups
    ├── iteration-1/
    └── migration-backup/
```

## The Flow

1. **Configure** in `02-configurations/` using tools from `01-factory-tools/`
2. **Generate** outputs into `03-generated/`
3. **Test** using scenarios in `04-testing/`
4. **Collect feedback** in `05-feedback/`
5. **Archive** old versions in `06-archive/`

## Benefits

- **Clear separation** between tools, inputs, and outputs
- **Easy to follow** the transformation flow
- **Version tracking** - see what each generator produces
- **No mixing** of source tools with generated artifacts
- **Organized by purpose** not by technology