// Test script to verify video filtering
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFiltering() {
    try {
        // Get user IDs
        const naman = await prisma.user.findFirst({
            where: { email: 'naman@user.com' }
        });

        const jainil = await prisma.user.findFirst({
            where: { email: 'jainil.shah03@gmail.com' }
        });

        if (!naman || !jainil) {
            console.log('❌ Could not find required users');
            return;
        }

        console.log('\n👤 Users:');
        console.log(`  Naman: ${naman.id}`);
        console.log(`  Jainil: ${jainil.id}`);

        // Test filtering for Naman (should NOT see Jainil's video)
        console.log('\n📹 Videos for Naman (naman@user.com):');
        const namanVideos = await prisma.video.findMany({
            where: {
                OR: [
                    { visibility: "PUBLIC" },
                    { targetedId: naman.id },
                    { targetedId: null }
                ]
            },
            select: {
                title: true,
                visibility: true,
                targetedId: true
            }
        });

        console.log(`  Total: ${namanVideos.length} videos`);
        namanVideos.forEach(v => {
            const assigned = v.targetedId === naman.id ? '(assigned to Naman)' :
                v.targetedId === null ? '(not assigned)' :
                    '(assigned to someone else)';
            console.log(`  - ${v.title} [${v.visibility}] ${assigned}`);
        });

        const namanHasJainilVideo = namanVideos.some(v => v.title.includes('Jainil'));
        console.log(`  ❌ Has "Test Video - Assigned to Jainil": ${namanHasJainilVideo ? 'YES (WRONG!)' : 'NO (CORRECT!)'}`);

        // Test filtering for Jainil (SHOULD see his video)
        console.log('\n📹 Videos for Jainil (jainil.shah03@gmail.com):');
        const jainilVideos = await prisma.video.findMany({
            where: {
                OR: [
                    { visibility: "PUBLIC" },
                    { targetedId: jainil.id },
                    { targetedId: null }
                ]
            },
            select: {
                title: true,
                visibility: true,
                targetedId: true
            }
        });

        console.log(`  Total: ${jainilVideos.length} videos`);
        jainilVideos.forEach(v => {
            const assigned = v.targetedId === jainil.id ? '(assigned to Jainil)' :
                v.targetedId === null ? '(not assigned)' :
                    '(assigned to someone else)';
            console.log(`  - ${v.title} [${v.visibility}] ${assigned}`);
        });

        const jainilHasJainilVideo = jainilVideos.some(v => v.title.includes('Jainil'));
        console.log(`  ✅ Has "Test Video - Assigned to Jainil": ${jainilHasJainilVideo ? 'YES (CORRECT!)' : 'NO (WRONG!)'}`);

        // Summary
        console.log('\n📊 Summary:');
        console.log(`  ✅ Filtering is ${!namanHasJainilVideo && jainilHasJainilVideo ? 'WORKING CORRECTLY' : 'NOT WORKING'}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFiltering();
