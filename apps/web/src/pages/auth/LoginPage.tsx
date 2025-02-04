import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { IJwtPayload } from '@novu/shared';

import { useAuthContext } from '../../components/providers/AuthProvider';
import { LoginForm } from '../../components/auth/LoginForm';
import AuthLayout from '../../components/layout/components/AuthLayout';
import AuthContainer from '../../components/layout/components/AuthContainer';
import { useVercelIntegration } from '../../hooks/useVercelIntegration';
import SetupLoader from '../../components/auth/SetupLoader';
import { useVercelParams } from '../../hooks/useVercelParams';
import { useSegment } from '../../components/providers/SegmentProvider';
import { useAcceptInvite } from '../../components/auth/useAcceptInvite';
import { useBlueprint } from '../../hooks/useBlueprint';
import { ROUTES } from '../../constants/routes.enum';

export default function LoginPage() {
  useBlueprint();
  const { setToken, token: oldToken } = useAuthContext();
  const segment = useSegment();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryToken = params.get('token');
  const invitationToken = params.get('invitationToken');
  const source = params.get('source');
  const sourceWidget = params.get('source_widget');
  const token = queryToken ?? oldToken;

  const { startVercelSetup, isLoading } = useVercelIntegration();
  const { code, isFromVercel, next } = useVercelParams();
  const { isLoading: isLoadingAcceptInvite, submitToken } = useAcceptInvite();

  useEffect(() => {
    if (token) {
      const user = jwtDecode<IJwtPayload>(token);

      if (!invitationToken && (!user.organizationId || !user.environmentId)) {
        const authApplicationLink = isFromVercel
          ? `${ROUTES.AUTH_APPLICATION}?code=${code}&next=${next}`
          : ROUTES.AUTH_APPLICATION;
        setToken(token);
        navigate(authApplicationLink);

        return;
      }

      if (isFromVercel) {
        setToken(token);
        startVercelSetup();

        return;
      }

      if (source === 'cli') {
        segment.track('Dashboard Visit', {
          widget: sourceWidget || 'unknown',
          source: 'cli',
        });
        setToken(token);
        navigate(ROUTES.QUICKSTART);

        return;
      }

      if (invitationToken) {
        submitToken(token, invitationToken);

        return;
      }

      setToken(token);
      navigate('/');
    }
  }, [token]);

  return (
    <AuthLayout>
      {isLoading || isLoadingAcceptInvite ? (
        <SetupLoader title="Loading..." />
      ) : (
        <AuthContainer
          title="Sign In"
          description="Welcome back! Sign in with the data you entered in your registration"
        >
          <LoginForm />
        </AuthContainer>
      )}
    </AuthLayout>
  );
}
