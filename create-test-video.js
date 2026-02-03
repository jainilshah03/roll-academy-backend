// Script to create a test video assigned to a specific user
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestVideo() {
    try {
        // First, get all users to find their IDs
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                gymId: true
            }
        });

        console.log('\n📋 Available Users:');
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.name}) - ID: ${user.id}`);
        });

        // Find Jainil and Naman
        const jainil = users.find(u => u.email.includes('jainil') || u.name?.toLowerCase().includes('jainil'));
        const naman = users.find(u => u.email === 'naman@user.com');

        if (!jainil) {
            console.log('\n⚠️  Could not find Jainil user. Using first non-naman user.');
        }
        if (!naman) {
            console.log('\n⚠️  Could not find naman@user.com');
        }

        const targetUser = jainil || users.find(u => u.email !== 'naman@user.com');

        if (!targetUser) {
            console.log('\n❌ No suitable user found to assign video to');
            return;
        }

        console.log(`\n✅ Will assign video to: ${targetUser.email} (${targetUser.name})`);
        console.log(`   User ID: ${targetUser.id}`);

        // Create a test video assigned to this user
        const video = await prisma.video.create({
            data: {
                title: 'Test Video - Assigned to ' + (targetUser.name || targetUser.email),
                description: 'This video should only be visible to ' + (targetUser.name || targetUser.email),
                url: '/uploads/record_000011 (online-video-cutter.com).mp4',
                visibility: 'PRIVATE',
                targetedId: targetUser.id,
                gymId: targetUser.gymId
            }
        });

        console.log('\n✅ Video created successfully!');
        console.log(`   Video ID: ${video.id}`);
        console.log(`   Title: ${video.title}`);
        console.log(`   Assigned to: ${targetUser.email}`);
        console.log(`   Visibility: ${video.visibility}`);
        console.log(`   TargetedId: ${video.targetedId}`);

        // Show all videos and their assignments
        console.log('\n📹 All Videos:');
        const allVideos = await prisma.video.findMany({
            select: {
                id: true,
                title: true,
                visibility: true,
                targetedId: true,
                targetedUser: {
                    select: {
                        email: true,
                        name: true
                    }
                }
            }
        });

        allVideos.forEach(v => {
            const assignedTo = v.targetedUser
                ? `${v.targetedUser.email} (${v.targetedUser.name})`
                : 'Not assigned (null)';
            console.log(`  - ${v.title}`);
            console.log(`    Visibility: ${v.visibility}, Assigned to: ${assignedTo}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestVideo();
