import { withAuth } from '../middleware/withAuth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends VercelRequest {
  user: {
    id: string;
    email: string;
    first_name?: string;
    role: string;
  };
}

// Main Handler
async function handler(req: VercelRequest, res: VercelResponse) {
  // User is already attached to req by middleware
  const user = (req as AuthenticatedRequest).user;
  
  // 5. Return protected data
  return res.status(200).json({
    success: true,
    message: 'You have access to protected data!',
    user: {
      id: user.id,
      email: user.email,
      name: user.first_name,
      role: user.role
    },
    data: {
      // Your protected data here
      secret: 'This is only visible to authenticated users'
    }
  });
}

// Wrap with auth middleware
export default withAuth(handler, {
  roles: ['admin', 'teacher']
});
