"""
Email template builder for QuestMaster notifications.

Each template function returns a dict with:
  - subject: str
  - html_body: str
  - text_body: str

All templates use Spanish language, dark-themed inline CSS,
QuestMaster branding, and an unsubscribe link placeholder.
"""

# ── Shared styles ─────────────────────────────────────────────────────

_BRAND_COLOR = "#8b5cf6"  # violet-500
_BG_COLOR = "#0f172a"  # navy-950
_CARD_BG = "#1e293b"  # navy-800
_TEXT_COLOR = "#e2e8f0"  # slate-200
_MUTED_COLOR = "#94a3b8"  # slate-400
_ACCENT_GREEN = "#10b981"  # emerald-500
_ACCENT_AMBER = "#f59e0b"  # amber-500


def _base_html(title: str, content: str) -> str:
    """Wrap content in the shared HTML email shell."""
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:{_BG_COLOR};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BG_COLOR};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:{_CARD_BG};border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,{_BRAND_COLOR},#6d28d9);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:28px;color:#ffffff;letter-spacing:1px;">QuestMaster</h1>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:2px;text-transform:uppercase;">Aventuras Interactivas</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              {content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(148,163,184,0.15);text-align:center;">
              <p style="margin:0;font-size:12px;color:{_MUTED_COLOR};">
                &copy; 2026 QuestMaster. Todos los derechos reservados.
              </p>
              <p style="margin:8px 0 0;font-size:12px;">
                <a href="{{{{unsubscribe_url}}}}" style="color:{_BRAND_COLOR};text-decoration:underline;">Cancelar suscripcion</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _button(text: str, url: str) -> str:
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">'
        f'<tr><td style="background-color:{_BRAND_COLOR};border-radius:8px;">'
        f'<a href="{url}" style="display:inline-block;padding:14px 32px;font-size:16px;'
        f'color:#ffffff;text-decoration:none;font-weight:600;">{text}</a>'
        f'</td></tr></table>'
    )


# ── Templates ─────────────────────────────────────────────────────────


def welcome_email(user_name: str) -> dict:
    """Welcome email sent after registration."""
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Bienvenido a QuestMaster, {user_name}!</h2>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Estamos encantados de tenerte en nuestra comunidad de aventureros. Con QuestMaster podras
        explorar ubicaciones reales, hablar con personajes de IA y completar desafios increibles.
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Tu viaje comienza ahora. Elige tu primera quest y empieza a acumular puntos.
      </p>
      {_button("Explorar Quests", "{{{{app_url}}}}/quests")}
      <p style="margin:24px 0 0;font-size:13px;color:{_MUTED_COLOR};">
        Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.
      </p>
    """
    return {
        "subject": "Bienvenido a QuestMaster - Tu aventura comienza ahora",
        "html_body": _base_html("Bienvenido a QuestMaster", content),
        "text_body": (
            f"Bienvenido a QuestMaster, {user_name}!\n\n"
            "Estamos encantados de tenerte en nuestra comunidad de aventureros. "
            "Con QuestMaster podras explorar ubicaciones reales, hablar con personajes "
            "de IA y completar desafios increibles.\n\n"
            "Tu viaje comienza ahora. Visita {{app_url}}/quests para elegir tu primera quest.\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }


def quest_completed(user_name: str, quest_title: str, score: int, total_points: int) -> dict:
    """Notification when a user completes a quest."""
    percentage = round((score / total_points) * 100) if total_points else 0
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Quest completada!</h2>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Felicidades, {user_name}! Has completado la quest <strong style="color:{_ACCENT_GREEN};">"{quest_title}"</strong>.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BG_COLOR};border-radius:12px;padding:20px;margin:20px 0;">
        <tr>
          <td style="text-align:center;padding:16px;">
            <p style="margin:0;font-size:36px;font-weight:700;color:{_ACCENT_GREEN};">{score}/{total_points}</p>
            <p style="margin:4px 0 0;font-size:14px;color:{_MUTED_COLOR};">Puntuacion ({percentage}%)</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Sigue explorando para desbloquear mas logros y subir en el ranking.
      </p>
      {_button("Ver mis logros", "{{{{app_url}}}}/achievements")}
    """
    return {
        "subject": f"Quest completada: {quest_title} - {score} puntos!",
        "html_body": _base_html("Quest completada", content),
        "text_body": (
            f"Felicidades, {user_name}!\n\n"
            f'Has completado la quest "{quest_title}" con {score}/{total_points} puntos ({percentage}%).\n\n'
            "Sigue explorando para desbloquear mas logros y subir en el ranking.\n\n"
            "Ver logros: {{app_url}}/achievements\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }


def achievement_unlocked(user_name: str, achievement_title: str, achievement_description: str) -> dict:
    """Notification when a user earns an achievement."""
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Logro desbloqueado!</h2>
      <p style="margin:0 0 20px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Enhorabuena, {user_name}! Has desbloqueado un nuevo logro:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BG_COLOR};border-radius:12px;border:1px solid {_ACCENT_AMBER};margin:20px 0;">
        <tr>
          <td style="text-align:center;padding:24px;">
            <p style="margin:0;font-size:24px;font-weight:700;color:{_ACCENT_AMBER};">{achievement_title}</p>
            <p style="margin:8px 0 0;font-size:14px;color:{_MUTED_COLOR};">{achievement_description}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Visita tu perfil para ver todos tus logros y compartirlos con la comunidad.
      </p>
      {_button("Ver logro", "{{{{app_url}}}}/achievements")}
    """
    return {
        "subject": f"Logro desbloqueado: {achievement_title}",
        "html_body": _base_html("Logro desbloqueado", content),
        "text_body": (
            f"Enhorabuena, {user_name}!\n\n"
            f'Has desbloqueado el logro "{achievement_title}": {achievement_description}\n\n'
            "Visita {{app_url}}/achievements para ver todos tus logros.\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }


def weekly_summary(
    user_name: str,
    quests_completed: int,
    points_earned: int,
    rank: int,
    streak_days: int,
) -> dict:
    """Weekly activity summary email."""
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Tu resumen semanal</h2>
      <p style="margin:0 0 20px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Hola {user_name}, aqui tienes un resumen de tu actividad esta semana:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BG_COLOR};border-radius:12px;margin:20px 0;">
        <tr>
          <td style="padding:20px;text-align:center;width:25%;border-right:1px solid rgba(148,163,184,0.15);">
            <p style="margin:0;font-size:28px;font-weight:700;color:{_BRAND_COLOR};">{quests_completed}</p>
            <p style="margin:4px 0 0;font-size:12px;color:{_MUTED_COLOR};">Quests</p>
          </td>
          <td style="padding:20px;text-align:center;width:25%;border-right:1px solid rgba(148,163,184,0.15);">
            <p style="margin:0;font-size:28px;font-weight:700;color:{_ACCENT_GREEN};">{points_earned}</p>
            <p style="margin:4px 0 0;font-size:12px;color:{_MUTED_COLOR};">Puntos</p>
          </td>
          <td style="padding:20px;text-align:center;width:25%;border-right:1px solid rgba(148,163,184,0.15);">
            <p style="margin:0;font-size:28px;font-weight:700;color:{_ACCENT_AMBER};">#{rank}</p>
            <p style="margin:4px 0 0;font-size:12px;color:{_MUTED_COLOR};">Ranking</p>
          </td>
          <td style="padding:20px;text-align:center;width:25%;">
            <p style="margin:0;font-size:28px;font-weight:700;color:#f43f5e;">{streak_days}</p>
            <p style="margin:4px 0 0;font-size:12px;color:{_MUTED_COLOR};">Dias racha</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Sigue asi! Cada quest te acerca mas a la cima del ranking.
      </p>
      {_button("Seguir explorando", "{{{{app_url}}}}/quests")}
    """
    return {
        "subject": f"Tu semana en QuestMaster: {quests_completed} quests, {points_earned} puntos",
        "html_body": _base_html("Resumen semanal", content),
        "text_body": (
            f"Hola {user_name}!\n\n"
            "Resumen semanal de QuestMaster:\n"
            f"  - Quests completadas: {quests_completed}\n"
            f"  - Puntos ganados: {points_earned}\n"
            f"  - Posicion en ranking: #{rank}\n"
            f"  - Dias de racha: {streak_days}\n\n"
            "Sigue asi! Visita {{app_url}}/quests para seguir explorando.\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }


def account_deletion_confirmation(user_name: str) -> dict:
    """Confirmation email when an account deletion is requested."""
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Confirmacion de eliminacion de cuenta</h2>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Hola {user_name}, hemos recibido tu solicitud para eliminar tu cuenta de QuestMaster.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Tu cuenta y todos los datos asociados seran eliminados permanentemente en un plazo de
        <strong style="color:#f43f5e;">30 dias</strong>. Si cambias de opinion, puedes cancelar
        la solicitud en cualquier momento desde tu perfil.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(244,63,94,0.1);border-radius:12px;border:1px solid rgba(244,63,94,0.3);margin:20px 0;">
        <tr>
          <td style="padding:20px;text-align:center;">
            <p style="margin:0;font-size:14px;color:#fda4af;">Esta accion eliminara: quests completadas, logros, puntuaciones y datos de perfil.</p>
          </td>
        </tr>
      </table>
      {_button("Cancelar eliminacion", "{{{{app_url}}}}/settings")}
      <p style="margin:24px 0 0;font-size:13px;color:{_MUTED_COLOR};">
        Si no has solicitado esto, contacta con soporte inmediatamente.
      </p>
    """
    return {
        "subject": "Confirmacion: solicitud de eliminacion de cuenta QuestMaster",
        "html_body": _base_html("Eliminacion de cuenta", content),
        "text_body": (
            f"Hola {user_name},\n\n"
            "Hemos recibido tu solicitud para eliminar tu cuenta de QuestMaster.\n\n"
            "Tu cuenta y todos los datos asociados seran eliminados permanentemente "
            "en un plazo de 30 dias. Si cambias de opinion, puedes cancelar la solicitud "
            "desde {{app_url}}/settings.\n\n"
            "Si no has solicitado esto, contacta con soporte inmediatamente.\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }


def quest_approved(user_name: str, quest_title: str) -> dict:
    """Notification when an admin approves a user-submitted quest."""
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Tu quest ha sido aprobada!</h2>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Buenas noticias, {user_name}! Tu quest <strong style="color:{_ACCENT_GREEN};">"{quest_title}"</strong>
        ha sido revisada y aprobada por nuestro equipo.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Tu quest ya esta disponible para toda la comunidad. Otros aventureros podran
        explorarla y completar los desafios que has creado.
      </p>
      {_button("Ver mi quest", "{{{{app_url}}}}/quests")}
      <p style="margin:24px 0 0;font-size:13px;color:{_MUTED_COLOR};">
        Gracias por contribuir a la comunidad de QuestMaster!
      </p>
    """
    return {
        "subject": f"Quest aprobada: {quest_title}",
        "html_body": _base_html("Quest aprobada", content),
        "text_body": (
            f"Buenas noticias, {user_name}!\n\n"
            f'Tu quest "{quest_title}" ha sido revisada y aprobada por nuestro equipo.\n\n'
            "Tu quest ya esta disponible para toda la comunidad. Visita {{app_url}}/quests "
            "para verla en vivo.\n\n"
            "Gracias por contribuir a la comunidad de QuestMaster!\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }


def quest_rejected(user_name: str, quest_title: str, reason: str) -> dict:
    """Notification when an admin rejects a user-submitted quest."""
    content = f"""
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff;">Quest no aprobada</h2>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Hola {user_name}, tras revisar tu quest <strong style="color:{_ACCENT_AMBER};">"{quest_title}"</strong>,
        nuestro equipo ha decidido que necesita algunos cambios antes de publicarse.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{_BG_COLOR};border-radius:12px;border:1px solid rgba(245,158,11,0.3);margin:20px 0;">
        <tr>
          <td style="padding:20px;">
            <p style="margin:0 0 8px;font-size:13px;color:{_ACCENT_AMBER};font-weight:600;text-transform:uppercase;letter-spacing:1px;">Motivo</p>
            <p style="margin:0;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">{reason}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:15px;color:{_TEXT_COLOR};line-height:1.6;">
        Puedes editar tu quest y enviarla de nuevo para revision. No dudes en contactarnos
        si necesitas ayuda.
      </p>
      {_button("Editar quest", "{{{{app_url}}}}/admin/quests")}
    """
    return {
        "subject": f"Quest pendiente de cambios: {quest_title}",
        "html_body": _base_html("Quest no aprobada", content),
        "text_body": (
            f"Hola {user_name},\n\n"
            f'Tras revisar tu quest "{quest_title}", nuestro equipo ha decidido que necesita '
            "algunos cambios antes de publicarse.\n\n"
            f"Motivo: {reason}\n\n"
            "Puedes editar tu quest en {{app_url}}/admin/quests y enviarla de nuevo.\n\n"
            "-- El equipo de QuestMaster\n\n"
            "Cancelar suscripcion: {{unsubscribe_url}}"
        ),
    }
