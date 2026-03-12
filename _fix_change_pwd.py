import re

path = r'c:\inetpub\wwwroot\points-redemption-system\server\users\views.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the `# Minimum length` validation block with the new strength validator call.
#    This block is identical in both occurrences; replace() will fix both at once.
old_len_check = (
    '            # Minimum length\n'
    '            if len(new_password) < 6:\n'
    '                logger.debug("change_password: new password too short")\n'
    '                return Response({"error": "New password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)'
)
new_len_check = (
    '            # Password strength validation\n'
    '            pw_error = validate_password_strength(new_password)\n'
    '            if pw_error:\n'
    '                logger.debug(f"change_password: {pw_error}")\n'
    '                return Response({"error": pw_error}, status=status.HTTP_400_BAD_REQUEST)'
)

if old_len_check in content:
    content = content.replace(old_len_check, new_len_check)
    print(f'Replaced {content.count(new_len_check)} occurrence(s) of min-length check.')
else:
    print('WARNING: min-length check not found.')

# 2. Remove the duplicate @action(detail=False) change_password definition.
dup_start = (
    "\n    @action(detail=False, methods=['post'], url_path='change_password')\n"
    "    def change_password(self, request):\n"
    '        """Change the logged-in user\'s own password (requires current password verification)"""'
)
first_pos = content.find(dup_start)
second_pos = content.find(dup_start, first_pos + 1) if first_pos != -1 else -1

if second_pos != -1:
    unlock_marker = "    @action(detail=True, methods=['post'], url_path='unlock_account')"
    end_pos = content.find(unlock_marker, second_pos)
    if end_pos != -1:
        content = content[:second_pos] + '\n' + content[end_pos:]
        print('Duplicate change_password method removed.')
    else:
        print('ERROR: unlock_account marker not found after duplicate — skipping removal.')
elif first_pos == -1:
    print('WARNING: change_password action not found at all.')
else:
    print('No duplicate found (already removed or was never there).')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('users/views.py updated.')
