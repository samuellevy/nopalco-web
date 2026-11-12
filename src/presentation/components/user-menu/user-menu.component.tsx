import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, UserCircle, User, Users, LogOut, LogIn } from 'lucide-react';
import { clearAccount, useSession } from '@/main/config/session';
import * as S from './user-menu.styles';

export const UserMenu = ({ inline = false }: { inline?: boolean }) => {
  const { isAuthenticated, account } = useSession();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, isAuthenticated]);

  useEffect(() => {
    if (!open) return;
    container.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const outside = (event: MouseEvent | TouchEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        const items = Array.from(container.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || []);
        if (!items.length) return;
        event.preventDefault();
        const index = items.findIndex((item) => item === document.activeElement);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
            ? items.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next].focus();
      }
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('touchstart', outside);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('touchstart', outside);
      document.removeEventListener('keydown', keydown);
    };
  }, [open]);

  if (!isAuthenticated) {
    return inline ? (
      <S.Bar as="div" $inline>
        <S.Trigger
          type="button"
          title="Login"
          aria-label="Login"
          onClick={() => navigate('/login', { state: { from: location.pathname + location.search } })}
        >
          <LogIn size={20} aria-hidden="true" />
          <span>Login</span>
        </S.Trigger>
      </S.Bar>
    ) : null;
  }

  return (
    <S.Bar as={inline ? 'div' : 'header'} $inline={inline}>
      <S.Container ref={container}>
        <S.Trigger
          ref={trigger}
          type="button"
          title="Menu do usuário"
          aria-label="Menu do usuário"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <UserCircle size={22} aria-hidden="true" />
          {!inline && <span>{account?.name || account?.username}</span>}
          {!inline && <ChevronDown size={16} aria-hidden="true" />}
        </S.Trigger>
        {open && (
          <S.Menu id={menuId} role="menu" aria-label="Menu do usuário">
            <S.Item to="/account" role="menuitem" onClick={() => setOpen(false)}>
              <User size={18} aria-hidden="true" /> Informações do usuário
            </S.Item>
            <S.Item to="/groups" role="menuitem" onClick={() => setOpen(false)}>
              <Users size={18} aria-hidden="true" /> Grupos
            </S.Item>
            <S.MenuAction
              type="button"
              role="menuitem"
              onClick={() => {
                clearAccount();
                setOpen(false);
                navigate('/');
              }}
            >
              <LogOut size={18} aria-hidden="true" /> Sair da conta
            </S.MenuAction>
          </S.Menu>
        )}
      </S.Container>
    </S.Bar>
  );
};
