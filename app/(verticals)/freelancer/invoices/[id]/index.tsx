import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFreelancerInvoice, useDeleteInvoice } from '../../../../../src/hooks/useFreelancer'
import { InvoiceStatus } from '../../../../../src/types/freelancer'

import { printToFileAsync } from 'expo-print'
import { shareAsync } from 'expo-sharing'
import * as FileSystem from 'expo-file-system'
import { supabase } from '../../../../../src/lib/supabase'

export default function InvoiceDetailsPage() {
    const { id } = useLocalSearchParams()
    const { data: invoice, isLoading } = useFreelancerInvoice(id as string)
    const deleteInvoiceMutation = useDeleteInvoice()
    const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false)

    const generatePdf = async () => {
        if (!invoice) return

        try {
            setIsGeneratingPdf(true)

            // Fetch company profile for logo
            const { data: { user } } = await supabase.auth.getUser()
            let companyLogo = null
            let companyName = 'Freelancer'

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('company_logo, full_name, company_name')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    companyLogo = profile.company_logo
                    // Use company name if available, otherwise use full name
                    companyName = profile.company_name || profile.full_name || 'Freelancer'
                }
            }

            const html = `
                <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                        <style>
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                                font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                            }
                            body {
                                padding: 20px;
                                color: #333;
                                background: #fff;
                                font-size: 12px;
                                line-height: 1.4;
                            }
                            .invoice-container {
                                max-width: 100%;
                                margin: 0 auto;
                            }
                            .header {
                                display: flex;
                                justify-content: space-between;
                                padding: 20px;
                                background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
                                color: white;
                                border-radius: 8px;
                            }
                            .logo-container {
                                display: flex;
                                align-items: center;
                            }
                            .logo {
                                width: 60px;
                                height: 60px;
                                border-radius: 10px;
                                margin-right: 15px;
                                object-fit: cover;
                                border: 2px solid rgba(255,255,255,0.3);
                            }
                            .company-name {
                                font-size: 20px;
                                font-weight: 700;
                                margin-bottom: 3px;
                            }
                            .company-tagline {
                                font-size: 11px;
                                opacity: 0.9;
                            }
                            .invoice-title {
                                text-align: right;
                            }
                            .invoice-title h1 {
                                font-size: 28px;
                                margin: 0 0 8px 0;
                                font-weight: 800;
                                letter-spacing: 1px;
                            }
                            .invoice-meta {
                                font-size: 12px;
                                margin: 3px 0;
                                opacity: 0.9;
                            }
                            .invoice-meta strong {
                                font-weight: 600;
                            }
                            .content {
                                padding: 20px;
                            }
                            .section {
                                margin-bottom: 20px;
                            }
                            .section-title {
                                font-size: 13px;
                                color: #7C3AED;
                                text-transform: uppercase;
                                letter-spacing: 1px;
                                margin-bottom: 10px;
                                font-weight: 700;
                                border-bottom: 1px solid #f0f0f0;
                                padding-bottom: 6px;
                            }
                            .client-info {
                                font-size: 13px;
                                line-height: 1.6;
                            }
                            .client-name {
                                font-size: 16px;
                                font-weight: 700;
                                margin-bottom: 3px;
                                color: #111827;
                            }
                            .client-company {
                                font-size: 13px;
                                color: #4B5563;
                                margin-bottom: 3px;
                            }
                            .client-contact {
                                color: #6B7280;
                                font-size: 12px;
                            }
                            .table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 15px 0;
                                font-size: 12px;
                            }
                            .table th {
                                background: #f8f9fa;
                                color: #4B5563;
                                font-weight: 700;
                                text-align: left;
                                padding: 10px 12px;
                                font-size: 11px;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }
                            .table td {
                                padding: 10px 12px;
                                border-bottom: 1px solid #eee;
                                font-size: 12px;
                            }
                            .table tr:last-child td {
                                border-bottom: none;
                            }
                            .table tr:nth-child(even) {
                                background: #f9fafb;
                            }
                            .amount-col {
                                text-align: right;
                                font-weight: 600;
                            }
                            .description-col {
                                font-weight: 500;
                            }
                            .total-section {
                                display: flex;
                                justify-content: flex-end;
                                margin: 20px 0;
                            }
                            .total-box {
                                width: 250px;
                                background: #f8f9fa;
                                border-radius: 8px;
                                padding: 15px;
                            }
                            .total-row {
                                display: flex;
                                justify-content: space-between;
                                padding: 8px 0;
                                font-size: 13px;
                            }
                            .total-label {
                                font-weight: 500;
                                color: #4B5563;
                            }
                            .total-amount {
                                font-weight: 600;
                                color: #111827;
                            }
                            .grand-total {
                                border-top: 1px solid #e5e7eb;
                                margin-top: 10px;
                                padding-top: 10px;
                            }
                            .grand-total .total-label {
                                font-size: 14px;
                                font-weight: 700;
                                color: #111827;
                            }
                            .grand-total .total-amount {
                                font-size: 16px;
                                font-weight: 800;
                                color: #7C3AED;
                            }
                            .notes {
                                background: #f0f9ff;
                                border-radius: 8px;
                                padding: 15px;
                                margin: 20px 0;
                                border-left: 3px solid #3B82F6;
                            }
                            .notes-content {
                                color: #374151;
                                line-height: 1.5;
                                font-size: 12px;
                            }
                            .footer {
                                text-align: center;
                                color: #9CA3AF;
                                font-size: 11px;
                                padding: 15px 0 10px;
                                border-top: 1px solid #eee;
                                margin-top: 15px;
                            }
                            .status-badge {
                                display: inline-block;
                                padding: 4px 8px;
                                border-radius: 15px;
                                font-weight: 600;
                                font-size: 11px;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            }
                            .status-draft { background: #E5E7EB; color: #4B5563; }
                            .status-sent { background: #DBEAFE; color: #2563EB; }
                            .status-paid { background: #D1FAE5; color: #059669; }
                            .status-overdue { background: #FEF2F2; color: #DC2626; }
                            .status-cancelled { background: #F3F4F6; color: #6B7280; }
                            @page {
                                size: A4;
                                margin: 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-container">
                            <div class="header">
                                <div class="logo-container">
                                    ${companyLogo ? `<img src="${companyLogo}" class="logo" />` : ''}
                                    <div>
                                        <div class="company-name">${companyName}</div>
                                        <div class="company-tagline">Professional Services</div>
                                    </div>
                                </div>
                                <div class="invoice-title">
                                    <h1>INVOICE</h1>
                                    <div class="invoice-meta"><strong>Invoice #:</strong> ${invoice.invoice_number}</div>
                                    <div class="invoice-meta"><strong>Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</div>
                                    <div class="invoice-meta"><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</div>
                                    <div class="invoice-meta">
                                        <span class="status-badge status-${invoice.status}">
                                            ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="content">
                                <div class="section">
                                    <div class="section-title">Bill To</div>
                                    <div class="client-info">
                                        <div class="client-name">${invoice.client?.full_name}</div>
                                        ${invoice.client?.company_name ? `<div class="client-company">${invoice.client.company_name}</div>` : ''}
                                        ${invoice.client?.email ? `<div class="client-contact">${invoice.client.email}</div>` : ''}
                                    </div>
                                </div>
                                
                                <div class="section">
                                    <div class="section-title">Tasks</div>
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${invoice.items?.map(task => `
                                                <tr>
                                                    <td class="description-col">${task.description}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div class="total-section">
                                    <div class="total-box">
                                        <div class="grand-total">
                                            <div class="total-row">
                                                <span class="total-label">Total Amount</span>
                                                <span class="total-amount">${invoice.currency} ${invoice.total_amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                ${invoice.notes ? `
                                    <div class="section">
                                        <div class="section-title">Notes</div>
                                        <div class="notes">
                                            <div class="notes-content">${invoice.notes}</div>
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="footer">
                                    Thank you for your business! Payment is due within ${Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.issue_date).getTime()) / (1000 * 60 * 60 * 24))} days.
                                </div>
                            </div>
                        </div>
                    </body>
                </html>
            `

            const { uri } = await printToFileAsync({
                html,
                base64: false
            });

            // Generate filename with client name and invoice number
            const clientName = invoice.client?.full_name?.replace(/\s+/g, '_') || 'client';
            const fileName = `${clientName}_Invoice_${invoice.invoice_number}.pdf`;

            await shareAsync(uri, { 
                UTI: '.pdf', 
                mimeType: 'application/pdf',
                dialogTitle: `Share ${fileName}`
            });

        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF')
            console.error(error)
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Invoice',
            'Are you sure you want to delete this invoice? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteInvoiceMutation.mutateAsync(id as string)
                            router.back()
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete invoice')
                        }
                    }
                }
            ]
        )
    }

    const getStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case 'paid': return '#10B981'
            case 'sent': return '#3B82F6'
            case 'overdue': return '#EF4444'
            case 'draft': return '#9CA3AF'
            case 'cancelled': return '#6B7280'
            default: return '#9CA3AF'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        )
    }

    if (!invoice) {
        return (
            <View style={styles.container}>
                <Text>Invoice not found</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Invoice Details</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push(`/(verticals)/freelancer/invoices/${id}/edit`)}
                    >
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
                            <Text style={styles.clientName}>{invoice.client?.full_name}</Text>
                            {invoice.client?.company_name && (
                                <Text style={styles.companyName}>{invoice.client.company_name}</Text>
                            )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(invoice.status || 'draft')}20` }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(invoice.status || 'draft') }]}>
                                {(invoice.status || 'draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.datesRow}>
                        <View>
                            <Text style={styles.label}>Issue Date</Text>
                            <Text style={styles.date}>{formatDate(invoice.issue_date)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.label}>Due Date</Text>
                            <Text style={[
                                styles.date,
                                invoice.status === 'overdue' && styles.overdueText
                            ]}>
                                {formatDate(invoice.due_date)}
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={generatePdf}
                    disabled={isGeneratingPdf}
                >
                    {isGeneratingPdf ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="download-outline" size={20} color="#fff" />
                            <Text style={styles.downloadButtonText}>Download PDF</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Tasks</Text>
                <View style={styles.card}>
                    {invoice.items?.map((task, index) => (
                        <View key={task.id} style={[
                            styles.itemRow,
                            index !== (invoice.items?.length || 0) - 1 && styles.itemBorder
                        ]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemDescription}>{task.description}</Text>
                                <Text style={styles.itemMeta}>
                                    {invoice.currency} {task.unit_price.toFixed(2)}
                                </Text>
                            </View>
                            <Text style={styles.itemAmount}>
                                {invoice.currency} {task.amount.toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>
                            {invoice.currency} {invoice.total_amount.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {invoice.notes && (
                    <>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <View style={styles.card}>
                            <Text style={styles.notesText}>{invoice.notes}</Text>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Delete Invoice</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    editButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    invoiceNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '600',
    },
    companyName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    datesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    date: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    overdueText: {
        color: '#EF4444',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        marginLeft: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    itemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemDescription: {
        fontSize: 16,
        color: '#111827',
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: 14,
        color: '#6B7280',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    notesText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        marginTop: 8,
    },
    deleteButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    downloadButtonText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 16,
    },
})
