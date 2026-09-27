# Configuración de Claude Code para gastar menos

Copia estos archivos a tu ordenador para que apliquen en todos tus proyectos:

| Archivo | Dónde va (Mac/Linux) | Dónde va (Windows) |
|---|---|---|
| `settings.json` | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` |
| `CLAUDE.md` | `~/.claude/CLAUDE.md` | `%USERPROFILE%\.claude\CLAUDE.md` |

Si ya tienes un `settings.json`, no lo sustituyas: añade solo las claves que falten.

## Qué hace cada ajuste

- `model: "opus"`: Opus por defecto.
- `effortLevel: "medium"`: esfuerzo medio por defecto. Para un problema difícil, súbelo en esa sesión con `/effort high`.
- `maxEffortLevel: "high"`: tope. Evita que acabes en `xhigh` o `max` sin darte cuenta, que son los que más gastan.
- `bashOutputMaxChars: 12000`: si un comando escupe más de eso (por defecto 30000), Claude recibe un resumen y la ruta del archivo completo en vez de meterlo todo en el contexto.
- `language: "spanish"`: responde en español.

## Opcional

- `"disableClaudeAiConnectors": true`: si tienes conectores de claude.ai (Gmail, Drive…) que no usas al programar, esto evita que se carguen en Claude Code.
