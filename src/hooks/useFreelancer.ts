import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { freelancerService } from '../services/freelancerService'
import { FreelancerClient, FreelancerProject, FreelancerTask, FreelancerDocument, FreelancerInvoice, FreelancerInvoiceItem } from '../types/freelancer'

export const useFreelancerStats = () => {
    return useQuery({
        queryKey: ['freelancer-stats'],
        queryFn: freelancerService.getStats
    })
}

export const useActiveProjects = () => {
    return useQuery({
        queryKey: ['freelancer-active-projects'],
        queryFn: async () => {
            const projects = await freelancerService.getProjects()
            return { data: projects.filter(p => p.status === 'in_progress') }
        }
    })
}

export const useFreelancerTasks = () => {
    return useQuery({
        queryKey: ['freelancer-tasks'],
        queryFn: async () => {
            const tasks = await freelancerService.getTasks()
            return { data: tasks }
        }
    })
}

export const useFreelancerTask = (id: string) => {
    return useQuery({
        queryKey: ['freelancer-task', id],
        queryFn: async () => {
            const task = await freelancerService.getTask(id)
            return { data: task }
        },
        enabled: !!id
    })
}

export const useCreateTask = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (task: Partial<FreelancerTask>) => freelancerService.createTask(task),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-tasks'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useUpdateTask = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<FreelancerTask> }) =>
            freelancerService.updateTask(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-tasks'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-task', data.id] })
        }
    })
}

export const useDeleteTask = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => freelancerService.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-tasks'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useFreelancerLeads = () => {
    return useQuery({
        queryKey: ['freelancer-leads'],
        queryFn: async () => {
            const leads = await freelancerService.getLeads()
            return { data: leads }
        }
    })
}

export const useFreelancerLead = (id: string) => {
    return useQuery({
        queryKey: ['freelancer-lead', id],
        queryFn: async () => {
            const lead = await freelancerService.getLead(id)
            return { data: lead }
        },
        enabled: !!id
    })
}

export const useCreateLead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (lead: Partial<any>) => freelancerService.createLead(lead),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-leads'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useUpdateLead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<any> }) =>
            freelancerService.updateLead(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-leads'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-lead', data.id] })
        }
    })
}

export const useDeleteLead = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => freelancerService.deleteLead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-leads'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useFreelancerClients = () => {
    return useQuery({
        queryKey: ['freelancer-clients'],
        queryFn: async () => {
            const clients = await freelancerService.getClients()
            return { data: { data: clients, total: clients.length, total_pages: 1 } }
        }
    })
}

export const useFreelancerClient = (id: string) => {
    return useQuery({
        queryKey: ['freelancer-client', id],
        queryFn: async () => {
            const client = await freelancerService.getClient(id)
            return { data: client }
        },
        enabled: !!id
    })
}

export const useCreateClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (client: Partial<FreelancerClient>) => freelancerService.createClient(client),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-clients'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useUpdateClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<FreelancerClient> }) =>
            freelancerService.updateClient(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-clients'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-client', data.id] })
        }
    })
}

export const useDeleteClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => freelancerService.deleteClient(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-clients'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useFreelancerProjects = () => {
    return useQuery({
        queryKey: ['freelancer-projects'],
        queryFn: async () => {
            const projects = await freelancerService.getProjects()
            return { data: { data: projects, total: projects.length, total_pages: 1 } }
        }
    })
}

export const useFreelancerProject = (id: string) => {
    return useQuery({
        queryKey: ['freelancer-project', id],
        queryFn: async () => {
            const project = await freelancerService.getProject(id)
            return { data: project }
        },
        enabled: !!id
    })
}

export const useCreateProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (project: Partial<FreelancerProject>) => freelancerService.createProject(project),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-projects'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-active-projects'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useUpdateProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates }: { id: string, updates: Partial<FreelancerProject> }) =>
            freelancerService.updateProject(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-projects'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-project', data.id] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-active-projects'] })
        }
    })
}

export const useDeleteProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => freelancerService.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-projects'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-active-projects'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useProjectDocuments = (projectId: string) => {
    return useQuery({
        queryKey: ['project-documents', projectId],
        queryFn: async () => {
            const docs = await freelancerService.getProjectDocuments(projectId)
            return { data: docs }
        },
        enabled: !!projectId
    })
}

export const useCreateDocument = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (doc: Partial<FreelancerDocument>) => freelancerService.createDocument(doc),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project-documents', variables.project_id] })
        }
    })
}

export const useFreelancerMeetings = () => {
    return useQuery({
        queryKey: ['freelancer-meetings'],
        queryFn: async () => {
            const meetings = await freelancerService.getMeetings()
            return { data: meetings }
        }
    })
}

export const useFreelancerReminders = () => {
    return useQuery({
        queryKey: ['freelancer-reminders'],
        queryFn: async () => {
            const reminders = await freelancerService.getReminders()
            return { data: reminders }
        }
    })
}

export const useFreelancerInvoices = () => {
    return useQuery({
        queryKey: ['freelancer-invoices'],
        queryFn: async () => {
            const invoices = await freelancerService.getInvoices()
            return { data: invoices }
        }
    })
}

export const useFreelancerInvoice = (id: string) => {
    return useQuery({
        queryKey: ['freelancer-invoice', id],
        queryFn: async () => {
            const invoice = await freelancerService.getInvoice(id)
            return invoice
        },
        enabled: !!id
    })
}

export const useCreateInvoice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ invoice, items }: { invoice: Partial<FreelancerInvoice>, items: Partial<FreelancerInvoiceItem>[] }) =>
            freelancerService.createInvoice(invoice, items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, updates, items }: { id: string, updates: Partial<FreelancerInvoice>, items?: Partial<FreelancerInvoiceItem>[] }) =>
            freelancerService.updateInvoice(id, updates, items),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-invoice', data.id] })
        }
    })
}

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => freelancerService.deleteInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['freelancer-invoices'] })
            queryClient.invalidateQueries({ queryKey: ['freelancer-stats'] })
        }
    })
}
