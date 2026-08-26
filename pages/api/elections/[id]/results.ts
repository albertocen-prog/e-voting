import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiRequestWithAuth, requireRole } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { createAuditLog } from '@/lib/db/audit';

/**
 * GET /api/elections/[id]/results
 * Get election results (aggregated vote counts)
 * Accessible to ELECTION_OFFICIAL, OBSERVER, and ADMIN
 */
const handleGet = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        ballots: {
          select: {
            id: true,
            title: true,
            options: {
              select: {
                id: true,
                label: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Only show results if election is closed or user is official/admin
    if (election.status !== 'CLOSED' && req.user?.role !== 'ELECTION_OFFICIAL' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Results not yet available' });
    }

    // Calculate results for each ballot
    const results = await Promise.all(
      election.ballots.map(async (ballot) => {
        const voteCounts = await prisma.vote.groupBy({
          by: ['optionId'],
          where: { ballotId: ballot.id },
          _count: {
            id: true,
          },
        });

        const optionResults = ballot.options.map((option) => {
          const voteCount = voteCounts.find((vc) => vc.optionId === option.id)?._count.id || 0;
          return {
            optionId: option.id,
            label: option.label,
            voteCount,
          };
        });

        const totalVotes = optionResults.reduce((sum, or) => sum + or.voteCount, 0);

        return {
          ballotId: ballot.id,
          title: ballot.title,
          options: optionResults,
          totalVotes,
        };
      })
    );

    return res.status(200).json({
      electionId: election.id,
      title: election.title,
      status: election.status,
      ballots: results,
    });
  } catch (error) {
    console.error('Get results error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/elections/[id]/results.csv
 * Export election results as CSV
 */
const handleGetCsv = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        ballots: {
          select: {
            id: true,
            title: true,
            options: {
              select: {
                id: true,
                label: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    // Only allow officials and admins to export
    if (req.user?.role !== 'ELECTION_OFFICIAL' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build CSV
    let csv = `Election: ${election.title}\n`;
    csv += `Date: ${new Date().toISOString()}\n`;
    csv += `Status: ${election.status}\n\n`;

    for (const ballot of election.ballots) {
      csv += `Ballot: ${ballot.title}\n`;
      csv += 'Option,Vote Count\n';

      const voteCounts = await prisma.vote.groupBy({
        by: ['optionId'],
        where: { ballotId: ballot.id },
        _count: {
          id: true,
        },
      });

      for (const option of ballot.options) {
        const voteCount = voteCounts.find((vc) => vc.optionId === option.id)?._count.id || 0;
        csv += `"${option.label}",${voteCount}\n`;
      }

      csv += '\n';
    }

    // Return as CSV file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="election-results-${id}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export results error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const handler = async (req: NextApiRequestWithAuth, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if CSV export requested
  if (req.url?.includes('.csv')) {
    return handleGetCsv(req, res);
  }

  return handleGet(req, res);
};

export default requireRole('ELECTION_OFFICIAL', 'OBSERVER', 'ADMIN')(handler);
