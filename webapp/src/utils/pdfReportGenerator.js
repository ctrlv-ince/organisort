import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Interpretation Generators ───

function generateSummaryInterpretation(data) {
    const paragraphs = [];
    if (data.totalScans >= 100) {
        paragraphs.push(`During the selected ${data.period.toLowerCase()} period, the platform recorded a robust ${data.totalScans} scan sessions, indicating strong user adoption and consistent engagement with the waste sorting system.`);
    } else if (data.totalScans >= 30) {
        paragraphs.push(`The platform recorded ${data.totalScans} scan sessions over the ${data.period.toLowerCase()} period, reflecting moderate engagement levels. There is room for growth through user outreach and awareness campaigns.`);
    } else {
        paragraphs.push(`With ${data.totalScans} scan sessions recorded in the ${data.period.toLowerCase()} period, platform usage is still in its early stages. Consider promotional activities and user onboarding initiatives to drive adoption.`);
    }
    const conf = parseFloat(data.avgConfidence);
    if (!isNaN(conf)) {
        if (conf >= 80) {
            paragraphs.push(`The model's average detection confidence of ${data.avgConfidence} demonstrates excellent classification accuracy, suggesting the AI model is well-trained for the current waste taxonomy.`);
        } else if (conf >= 60) {
            paragraphs.push(`An average detection confidence of ${data.avgConfidence} indicates adequate model performance. Consider expanding training data for underperforming classes to improve accuracy.`);
        } else {
            paragraphs.push(`The average detection confidence of ${data.avgConfidence} reveals opportunities for model improvement. Targeted dataset augmentation for low-confidence classes is recommended.`);
        }
    }
    if (data.activeUsers > 0 && data.totalScans > 0) {
        const spu = (data.totalScans / data.activeUsers).toFixed(1);
        paragraphs.push(`Each active user performed an average of ${spu} scans, with ${data.activeUsers} unique users contributing to the dataset. ${parseFloat(spu) >= 5 ? 'This suggests strong per-user retention and habitual usage.' : 'Encouraging repeat usage through gamification or notifications could improve this metric.'}`);
    }
    return paragraphs;
}

function generateTrendsInterpretation(data) {
    const paragraphs = [];
    if (data.trend === 'increasing') {
        paragraphs.push(`Platform activity shows a positive upward trajectory with ${data.growth} growth comparing the recent half of the period to the earlier half. This acceleration indicates growing user confidence and expanding adoption.`);
    } else if (data.trend === 'decreasing') {
        paragraphs.push(`Activity has declined by ${data.growth} over the period. This downward trend may warrant investigation into potential causes such as seasonal factors, technical issues, or user experience friction points.`);
    } else {
        paragraphs.push(`Platform usage has remained stable throughout the period, suggesting consistent but plateau-level engagement. Consider introducing new features or campaigns to re-energize growth.`);
    }
    if (data.peakDay) {
        paragraphs.push(`Peak activity was recorded on ${data.peakDay.date} with ${data.peakDay.scans} scan events. Understanding what drove this spike could inform strategies for sustaining higher engagement levels.`);
    }
    paragraphs.push(`The mean daily scan rate of ${data.averageDaily} sessions provides a baseline for performance monitoring. ${parseFloat(data.averageDaily) >= 5 ? 'This healthy daily throughput indicates the platform is being regularly utilized.' : 'Improving this baseline through targeted notifications or scheduled awareness campaigns is recommended.'}`);
    return paragraphs;
}

function generateUserInterpretation(data) {
    const paragraphs = [];
    const activeRatio = data.totalUsers > 0 ? ((data.activeUsers / data.totalUsers) * 100).toFixed(1) : '0';
    paragraphs.push(`Of the ${data.totalUsers} registered users, ${data.activeUsers} (${activeRatio}%) were active during the selected period, while ${data.inactiveUsers} users remained dormant. ${parseFloat(activeRatio) >= 60 ? 'This is a healthy engagement ratio.' : 'Re-engagement campaigns targeting inactive users could significantly boost platform utilization.'}`);
    if (data.topUsers.length > 0) {
        const top = data.topUsers[0];
        paragraphs.push(`The most active contributor (${top.displayName || top.email}) performed ${top.scans} scans covering ${top.uniqueTypes} distinct waste categories. ${data.topUsers.length >= 5 ? 'The top 5 users collectively drive a significant portion of platform activity, indicating a core power-user base.' : ''}`);
    }
    paragraphs.push(`Users averaged ${data.avgScansPerUser} scans each during the period. ${parseFloat(data.avgScansPerUser) >= 3 ? 'This indicates meaningful per-user engagement.' : 'Strategies such as progress tracking and achievement badges could help increase individual contributions.'}`);
    return paragraphs;
}

function generateWasteInterpretation(data) {
    const paragraphs = [];
    if (data.categoryBreakdown.length > 0) {
        const top = data.categoryBreakdown[0];
        paragraphs.push(`The "${top.category}" category dominates the waste composition at ${top.percentage}% of all detections (${top.count} items), suggesting this is the primary type of organic waste being processed on the platform.`);
    }
    paragraphs.push(`A total of ${data.totalItems} individual waste items were classified across ${data.uniqueTypes} distinct types. ${data.uniqueTypes >= 20 ? 'This broad diversity indicates the model is being exposed to a wide variety of real-world waste scenarios, which strengthens overall classification robustness.' : 'The relatively focused set of waste types suggests users are encountering a limited subset of the model\'s capabilities. Broader testing is encouraged.'}`);
    if (data.mostCommon && data.leastCommon) {
        paragraphs.push(`"${data.mostCommon.type}" was the most frequently detected item with ${data.mostCommon.count} occurrences, while "${data.leastCommon.type}" was the least common with only ${data.leastCommon.count} detection(s). This distribution can guide future model training priorities — increasing training data for rare classes may improve overall accuracy.`);
    }
    return paragraphs;
}

// ─── PDF Rendering Helpers ───

function checkPage(doc, yPos, needed = 30) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (yPos + needed > pageHeight - 25) {
        doc.addPage();
        return 20;
    }
    return yPos;
}

function drawMetricBoxes(doc, metrics, yPos, margin, contentWidth) {
    yPos = checkPage(doc, yPos, 50);
    const count = metrics.length;
    const gap = 4;
    const boxW = (contentWidth - gap * (count - 1)) / count;
    metrics.forEach((m, i) => {
        const x = margin + i * (boxW + gap);
        doc.setFillColor(...m.bg);
        doc.roundedRect(x, yPos, boxW, 34, 3, 3, 'F');
        // border
        doc.setDrawColor(...m.bg.map(c => Math.max(0, c - 30)));
        doc.setLineWidth(0.3);
        doc.roundedRect(x, yPos, boxW, 34, 3, 3, 'S');
        // label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(m.label.toUpperCase(), x + 6, yPos + 11);
        // value
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...m.valueColor);
        const valStr = String(m.value);
        if (valStr.length > 12) doc.setFontSize(10);
        doc.text(valStr, x + 6, yPos + 26);
    });
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    return yPos + 42;
}

function drawSectionTitle(doc, title, yPos, margin) {
    yPos = checkPage(doc, yPos, 20);
    doc.setFillColor(22, 163, 74);
    doc.rect(margin, yPos, 4, 12, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(title, margin + 8, yPos + 9);
    return yPos + 18;
}

function drawInterpretation(doc, paragraphs, yPos, margin, contentWidth) {
    yPos = drawSectionTitle(doc, 'Interpretation & Analysis', yPos, margin);
    const allLines = [];
    paragraphs.forEach((para, idx) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(para, contentWidth - 20);
        allLines.push(...lines);
        if (idx < paragraphs.length - 1) allLines.push('');
    });
    const boxH = allLines.length * 4.5 + 14;
    yPos = checkPage(doc, yPos, boxH + 5);
    // Background box
    doc.setFillColor(245, 250, 245);
    doc.roundedRect(margin, yPos, contentWidth, boxH, 3, 3, 'F');
    doc.setDrawColor(187, 222, 187);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, yPos, contentWidth, boxH, 3, 3, 'S');
    // Accent dot
    doc.setFillColor(22, 163, 74);
    doc.circle(margin + 9, yPos + 9, 3, 'F');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('i', margin + 7.8, yPos + 10.5);
    // Paragraphs
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 60, 50);
    let textY = yPos + 10;
    allLines.forEach(line => {
        doc.text(line, margin + 16, textY);
        textY += 4.5;
    });
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    return yPos + boxH + 10;
}

function drawHeader(doc, reportType, dateRangeLabel) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const titles = {
        summary: 'Executive Summary Report',
        trends: 'Activity Trends Report',
        users: 'User Activity Report',
        waste: 'Waste Composition Report',
    };
    const subtitles = {
        summary: 'Comprehensive overview of platform performance and key metrics',
        trends: 'Temporal analysis of scanning activity and growth patterns',
        users: 'User engagement metrics and contribution rankings',
        waste: 'Taxonomical breakdown and compositional analysis of detected waste',
    };
    // Primary band
    doc.setFillColor(15, 118, 53);
    doc.rect(0, 0, pageWidth, 32, 'F');
    // Accent band
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 32, pageWidth, 8, 'F');
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('OrganiSort', margin, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(titles[reportType] || 'Report', margin, 24);
    // Right metadata
    doc.setFontSize(8);
    doc.setTextColor(200, 230, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 15, { align: 'right' });
    doc.text(dateRangeLabel, pageWidth - margin, 22, { align: 'right' });
    // Subtitle on accent band
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(subtitles[reportType] || '', margin, 37.5);
    doc.setTextColor(0, 0, 0);
}

function drawFooter(doc) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const fy = pageHeight - 12;
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.5);
        doc.line(margin, fy - 4, pageWidth - margin, fy - 4);
        doc.setFontSize(7);
        doc.setTextColor(130, 140, 130);
        doc.setFont('helvetica', 'normal');
        doc.text('OrganiSort  •  Organic Waste Classification & Analytics Platform', margin, fy);
        doc.text(`Page ${i} of ${pageCount}  •  ${new Date().toLocaleDateString()}`, pageWidth - margin, fy, { align: 'right' });
    }
}

// ─── Main PDF Generator ───

export function generateReportPDF({
    reportType,
    dateRange,
    dateRangeLabel,
    summaryData,
    trendsData,
    userData,
    wasteData,
}) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    drawHeader(doc, reportType, dateRangeLabel);
    let yPos = 50;

    const green = [22, 163, 74];
    const tableHead = { fillColor: green, textColor: 255, fontStyle: 'bold', fontSize: 9 };
    const tableStyle = { cellPadding: 4, lineColor: [226, 232, 240], lineWidth: 0.2 };
    const altRow = { fillColor: [248, 250, 252] };

    if (reportType === 'summary' && summaryData) {
        const data = summaryData;
        yPos = drawMetricBoxes(doc, [
            { label: 'Total Scans', value: data.totalScans, bg: [239, 246, 255], valueColor: [30, 64, 175] },
            { label: 'Items Detected', value: data.totalItems, bg: [240, 253, 244], valueColor: [21, 128, 61] },
            { label: 'Unique Types', value: data.uniqueTypes, bg: [250, 245, 255], valueColor: [126, 34, 206] },
            { label: 'Active Users', value: data.activeUsers, bg: [255, 247, 237], valueColor: [194, 65, 12] },
        ], yPos, margin, contentWidth);

        yPos = drawSectionTitle(doc, 'Key Performance Metrics', yPos, margin);
        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Scans', String(data.totalScans)],
                ['Total Items Detected', String(data.totalItems)],
                ['Unique Waste Types', String(data.uniqueTypes)],
                ['Avg Items per Scan', String(data.avgItemsPerScan)],
                ['Avg Model Confidence', data.avgConfidence],
                ['Active Users', String(data.activeUsers)],
                ['Scans per User', data.activeUsers > 0 ? (data.totalScans / data.activeUsers).toFixed(2) : '0'],
            ],
            theme: 'grid',
            headStyles: tableHead,
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: altRow,
            styles: tableStyle,
            margin: { left: margin, right: margin },
        });
        yPos = doc.lastAutoTable?.finalY + 12 || yPos + 60;
        yPos = drawInterpretation(doc, generateSummaryInterpretation(data), yPos, margin, contentWidth);

    } else if (reportType === 'trends' && trendsData) {
        const data = trendsData;
        const trendColor = data.trend === 'increasing' ? [21, 128, 61] : data.trend === 'decreasing' ? [185, 28, 28] : [71, 85, 105];
        const trendBg = data.trend === 'increasing' ? [240, 253, 244] : data.trend === 'decreasing' ? [254, 242, 242] : [248, 250, 252];
        yPos = drawMetricBoxes(doc, [
            { label: 'Trend Direction', value: data.trend.charAt(0).toUpperCase() + data.trend.slice(1), bg: trendBg, valueColor: trendColor },
            { label: 'Growth Rate', value: data.growth, bg: [239, 246, 255], valueColor: [30, 64, 175] },
            { label: 'Mean Daily Scans', value: data.averageDaily, bg: [250, 245, 255], valueColor: [126, 34, 206] },
        ], yPos, margin, contentWidth);

        if (data.peakDay) {
            yPos = checkPage(doc, yPos, 12);
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text(`Peak Day: ${data.peakDay.date} — ${data.peakDay.scans} scan events recorded`, margin, yPos);
            yPos += 10;
        }

        yPos = drawSectionTitle(doc, 'Daily Activity Timeline', yPos, margin);
        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Scans', 'Items Detected', 'Unique Types']],
            body: data.dailyTrends.map(d => [d.date, String(d.scans), String(d.items), String(d.uniqueTypes)]),
            theme: 'grid',
            headStyles: { ...tableHead, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            alternateRowStyles: altRow,
            styles: { ...tableStyle, cellPadding: 3 },
            margin: { left: margin, right: margin },
        });
        yPos = doc.lastAutoTable?.finalY + 12 || yPos + 60;
        yPos = drawInterpretation(doc, generateTrendsInterpretation(data), yPos, margin, contentWidth);

    } else if (reportType === 'users' && userData) {
        const data = userData;
        const activeRatio = data.totalUsers > 0 ? ((data.activeUsers / data.totalUsers) * 100).toFixed(1) : '0';
        yPos = drawMetricBoxes(doc, [
            { label: 'Total Users', value: data.totalUsers, bg: [250, 245, 255], valueColor: [126, 34, 206] },
            { label: 'Active Users', value: `${data.activeUsers} (${activeRatio}%)`, bg: [240, 253, 244], valueColor: [21, 128, 61] },
            { label: 'Inactive', value: data.inactiveUsers, bg: [248, 250, 252], valueColor: [71, 85, 105] },
            { label: 'Avg Scans/User', value: data.avgScansPerUser, bg: [239, 246, 255], valueColor: [30, 64, 175] },
        ], yPos, margin, contentWidth);

        yPos = drawSectionTitle(doc, 'User Overview', yPos, margin);
        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Registered Users', String(data.totalUsers)],
                ['Active Users (in period)', String(data.activeUsers)],
                ['Inactive Users', String(data.inactiveUsers)],
                ['Active User Ratio', `${activeRatio}%`],
                ['Avg Scans per User', String(data.avgScansPerUser)],
            ],
            theme: 'grid',
            headStyles: tableHead,
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: altRow,
            styles: tableStyle,
            margin: { left: margin, right: margin },
        });
        yPos = doc.lastAutoTable?.finalY + 12 || yPos + 50;

        yPos = drawSectionTitle(doc, 'Top Active Users', yPos, margin);
        autoTable(doc, {
            startY: yPos,
            head: [['#', 'Email', 'Name', 'Scans', 'Items', 'Types', 'Last Active']],
            body: data.topUsers.map((u, i) => [
                String(i + 1), u.email, u.displayName, String(u.scans), String(u.items), String(u.uniqueTypes), u.lastActive
            ]),
            theme: 'grid',
            headStyles: { ...tableHead, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            alternateRowStyles: altRow,
            styles: { ...tableStyle, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 10, halign: 'center' } },
            margin: { left: margin, right: margin },
        });
        yPos = doc.lastAutoTable?.finalY + 12 || yPos + 60;
        yPos = drawInterpretation(doc, generateUserInterpretation(data), yPos, margin, contentWidth);

    } else if (reportType === 'waste' && wasteData) {
        const data = wasteData;
        yPos = drawMetricBoxes(doc, [
            { label: 'Total Items', value: data.totalItems, bg: [255, 247, 237], valueColor: [194, 65, 12] },
            { label: 'Unique Types', value: data.uniqueTypes, bg: [239, 246, 255], valueColor: [30, 64, 175] },
            { label: 'Most Common', value: data.mostCommon?.type || 'N/A', bg: [240, 253, 244], valueColor: [21, 128, 61] },
            { label: 'Least Common', value: data.leastCommon?.type || 'N/A', bg: [248, 250, 252], valueColor: [71, 85, 105] },
        ], yPos, margin, contentWidth);

        yPos = drawSectionTitle(doc, 'Category Breakdown', yPos, margin);
        autoTable(doc, {
            startY: yPos,
            head: [['Category', 'Count', 'Percentage']],
            body: data.categoryBreakdown.map(c => [c.category, String(c.count), `${c.percentage}%`]),
            theme: 'grid',
            headStyles: tableHead,
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: altRow,
            styles: tableStyle,
            margin: { left: margin, right: margin },
        });
        yPos = doc.lastAutoTable?.finalY + 12 || yPos + 60;

        yPos = drawSectionTitle(doc, 'Top 20 Detected Waste Types', yPos, margin);
        autoTable(doc, {
            startY: yPos,
            head: [['#', 'Waste Type', 'Count', 'Share']],
            body: data.topWaste.map((item, i) => [
                String(i + 1), item.type, String(item.count),
                data.totalItems > 0 ? `${((item.count / data.totalItems) * 100).toFixed(1)}%` : '0%'
            ]),
            theme: 'grid',
            headStyles: { ...tableHead, fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            alternateRowStyles: altRow,
            styles: { ...tableStyle, cellPadding: 3 },
            columnStyles: { 0: { cellWidth: 10, halign: 'center' } },
            margin: { left: margin, right: margin },
        });
        yPos = doc.lastAutoTable?.finalY + 12 || yPos + 60;
        yPos = drawInterpretation(doc, generateWasteInterpretation(data), yPos, margin, contentWidth);
    }

    drawFooter(doc);
    doc.save(`organisort_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
}
